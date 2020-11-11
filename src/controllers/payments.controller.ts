import * as express from 'express';
import { Payment } from 'interfaces/payments.interface';
import { LiqPayService } from '../services/liqpay.service';
import BaseController from "./base.controller";
// import { code200 } from "../../middleware";

export class PaymentsController extends BaseController {
    public path = '/payments';
    private payment = new LiqPayService();

    constructor() {
        super();
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.post(`${this.path}`, this.generatePayment);
        this.router.post(`${this.path}/:id`, this.checkPayment);
        this.router.post(`${this.path}/:id/status`, this.checkPaymentStatus);
    }

    private generatePayment = (request: express.Request, response: express.Response, next: express.NextFunction) => {
        const body: Payment = request.body;
        const { data, signature } = this.payment.cnb_form(body);
        const link = `https://www.liqpay.ua/api/3/checkout?data=${data}&signature=${signature}`;
        this.send200(response, link);
    };

    private checkPayment = (request: express.Request, response: express.Response, next: express.NextFunction) => {
        const { id } = request.params;
        response.redirect(301, `${process.env.FRONTEND_URL}/payment/${id}`);
    };
    private checkPaymentStatus = (request: express.Request, response: express.Response, next: express.NextFunction) => {
        const { id } = request.params
        this.payment.check({ order_id: id }, (body) => {
            this.send200(response, body)
        }, (err, response) => {
            next(this.send422(err.message || err))
        })
    };


}