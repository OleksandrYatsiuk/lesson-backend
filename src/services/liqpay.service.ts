import { Payment, EPaymentAction, PaymentForm } from './../interfaces/payments.interface';
import * as crypto from 'crypto';
import * as request from 'request';

export class LiqPayService {
    public host = 'https://www.liqpay.ua/api/';
    public_key = process.env.PUBLIC_KEY;
    private_key = process.env.PRIVATE_KEY;
    constructor() { }


    public cnb_form(params: Partial<Payment>): PaymentForm {
        return this.cnb_object(params, EPaymentAction.PAY)
    }

    public check(params: Partial<Payment>, cb: Function, e: Function): void {
        const { data, signature } = this.cnb_object(params, EPaymentAction.STATUS);
        request.post(`${this.host}request`, { form: { data, signature } }, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                cb(JSON.parse(body))
            } else {
                e(error, response);
            }
        }
        );
    };

    private str_to_sign(str: string): string {
        const sha1 = crypto.createHash('sha1');
        sha1.update(str);
        return sha1.digest('base64');
    };

    private cnb_params(params: Partial<Payment>, type: EPaymentAction): Partial<Payment> {

        params.public_key = this.public_key;
        if (!params.language)
            params.language = 'ua';
        if (!params.version)
            params.version = '3'
        if (!params.action)
            params.action = type
        switch (type) {
            case EPaymentAction.PAY:
                if (!params.currency)
                    params.currency = 'UAH'
                if (!params.amount)
                    throw new Error('Amount can not be blank');
                // if (!params.description)
                //     throw new Error('Description can not be blank');
                if (!params.order_id)
                    throw new Error('Order Id can not be blank');
                params.result_url = `http://localhost:5000/api/v1/payments/${params.order_id}`
                return params;
            case EPaymentAction.STATUS:
                if (!params.order_id)
                    throw new Error('Order Id can not be blank');
                return params;
        }
    };

    private cnb_object(params: Partial<Payment>, type: EPaymentAction): PaymentForm {
        params = this.cnb_params(params, type);
        const data = Buffer.from(JSON.stringify(params)).toString('base64');
        const signature = this.str_to_sign(this.private_key + data + this.private_key);
        return { data, signature };
    };
};

