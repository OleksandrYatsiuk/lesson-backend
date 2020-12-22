import { Course } from "./courses.interface";
import { User } from "./users.interface";


export interface PaymentData {
    readonly id: string;
    readonly _id: string;
    phone?: string;
    status: EPaymentStatus;
    userId?: string | User;
    user?: User;
    amount: number | string;
    courseId?: string | any;
    course?: Course;
}


export class PaymentModel implements Partial<PaymentData> {
    readonly id: string;
    readonly _id: string;
    phone?: string;
    courseId?: string | Course;
    status: EPaymentStatus;
    userId?: string | User;
    user?: User
    amount: number | string;
    course?: Course;
    constructor({
        _id = null,
        userId = null,
        courseId = null,
        status = null,
        amount = null
    } = {}) {
        this.id = _id;
        this.userId = userId;
        this.courseId = courseId;
        this.status = status;
        this.amount = amount;
    }

    serialize(): Partial<PaymentData> {
        const model: Partial<PaymentData> = {
            id: this.id,
            status: this.status,
            amount: this.amount,
            userId: this.userId,
            courseId: this.courseId,
        }
        if (typeof this.courseId === "object") {
            model.courseId = this.courseId.id;
            model.course = this.courseId;
        }
        if (typeof this.userId === "object") {
            model.userId = this.userId.id;
            model.user = this.userId;
        }
        return model;
    }
}

export interface Payment {
    userId?: string;
    courseId?: string;
    language?: TPaymentLanguage;
    action: TPaymentAction;
    public_key: string;
    amount: number | string;
    currency?: TPaymentCurrency;
    description: string;
    order_id: string;
    result_url: string;
    version?: string;
}


export type TPaymentLanguage = 'ua' | 'en' | 'ru';
export type TPaymentAction = 'pay' | 'status';
export type TPaymentCurrency = 'UAH';
export enum EPaymentAction {
    PAY = 'pay',
    STATUS = 'status'
}
export enum EPaymentStatus {
    SUCCESS = 'success',
    ERROR = 'error'
}

export interface PaymentForm {
    data: string;
    signature: string
}