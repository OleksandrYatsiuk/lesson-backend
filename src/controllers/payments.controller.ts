import * as express from 'express';
import * as mongoose from 'mongoose';

import { EPaymentStatus, Payment, PaymentData, PaymentModel } from '../interfaces/payments.interface';
import { LiqPayService } from '../services/liqpay.service';
import BaseController from "./base.controller";
import userModel from './schemas/users.schema';
import model from './schemas/payments.schema';
// import { code200 } from "../../middleware";

export class PaymentsController extends BaseController {
    public path = '/payments';
    private payment = new LiqPayService();
    private model: mongoose.Model<PaymentData & mongoose.Document>;
    public userModel = userModel;

    constructor() {
        super();
        this.initializeRoutes();
        this.model = model;
    }

    private initializeRoutes() {
        this.router.post(`${this.path}`, this.generatePayment);
        this.router.post(`${this.path}/:id`, this.checkPayment);
        this.router.post(`${this.path}/:id/status`, this.checkPaymentStatus);
    }

    private generatePayment = (request: express.Request, response: express.Response, next: express.NextFunction) => {
        const body: PaymentData = request.body;

        this.userModel.findOne({ phone: body.phone.slice(body.phone.length - 10) })
            .then(user => {
                if (user) {
                    this.model.create({ ...body, userId: user._id })
                        .then(record => {
                            const obj: Partial<Payment> = {
                                order_id: record._id,
                                amount: body.amount,
                            }
                            const { data, signature } = this.payment.cnb_form(obj);
                            const link = `https://www.liqpay.ua/api/3/checkout?data=${data}&signature=${signature}`;
                            this.send200(response, link);
                        })
                        .catch(e => console.log(e))
                } else {
                    this.send404('User');
                }
            })
            .catch(e => console.log(e))


    };

    private checkPayment = (request: express.Request, response: express.Response, next: express.NextFunction) => {
        const { id } = request.params;
        response.redirect(301, `${process.env.FRONTEND_URL}/payment/${id}`);
    };
    private checkPaymentStatus = (request: express.Request, response: express.Response, next: express.NextFunction) => {
        const { id } = request.params

        this.model.findById(id).populate('userId').populate('courseId').then(payment => {
            if (!payment.status) {
                this.payment.check({ order_id: id }, (body) => {
                    this.model.findByIdAndUpdate(id, { status: EPaymentStatus.SUCCESS }, { new: true })
                        .then(payment => {
                            this.userModel.findByIdAndUpdate(payment.userId, {
                                $set: { updatedAt: Date.now() },
                                $push: { courses: payment.courseId }
                            })
                                .then(result => this.send200(response, { result: payment }))
                                .catch(e => this.send500(e))
                        })
                        .catch(e => this.send500(e))
                }, (err, response) => {
                    next(this.send422(err.message || err))
                })
            } else {
                this.send200(response, new PaymentModel(payment).serialize());
            }
        })
            .catch(e => this.send500(e))
    };


}