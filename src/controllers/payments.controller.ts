import * as express from 'express';
import { LiqPayService } from '../services/liqpay.service';
import BaseController from "./base.controller";
// import { code200 } from "../../middleware";

export interface Payment {
    action?: string;
    amount: number | string;
    currency?: string;
    description: string;
    order_id: string;
    version?: string;
}

export class PaymentsController extends BaseController {
    public path = '/payments';
    private payment = new LiqPayService();

    constructor() {
        super();
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.post(`${this.path}`, this.generatePayment);
    }

    private generatePayment = (request: express.Request, response: express.Response, next: express.NextFunction) => {
        const data:Payment = request.body;
        const payment = this.payment.cnb_form({
            ...data,
            action: 'pay',
            currency: 'UAH',
            version: '3'
        });
        response.status(200).json({ result: payment });
        // code200(response, payment);
    };


}