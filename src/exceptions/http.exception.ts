export class HttpException extends Error {
    public code: number;
    public message: string;

    constructor(code:number, message: any) {
        super();
        this.code = code;
        this.message = message;
    }
}
