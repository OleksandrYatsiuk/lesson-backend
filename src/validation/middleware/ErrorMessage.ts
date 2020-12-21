import { ErrorInterface } from "./ErrorInterface";
import ErrorList from "./ErrorList";

export interface Params {
    value: any
}
export class ErrorMessage extends ErrorList {
    public code: number;

    constructor() {
        super();
        this.code = this.BASIC_ERROR;
    }

    public getMessage(code: number, params: Array<Params>): string {
        return params ? this.formatMessage(this.ERRORS[code], params) : this.ERRORS[code];
    }

    private formatMessage(message: string, params: Array<Params>): string {
        const regex = new RegExp('\{(.*?)\}');
        params.forEach(e => message = message.replace(regex, e.value));
        return message;
    }

    public addCustomError(field: string, code: number, params?:Array<Params>): ErrorInterface {
        return {
            field,
            message: this.getMessage(code, params),
            code
        }
    }



}