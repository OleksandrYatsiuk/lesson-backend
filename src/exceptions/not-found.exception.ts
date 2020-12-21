import { HttpException } from './http.exception';

export class NotFoundException extends HttpException {
    constructor(name: string) {
        super(404, `${name} was not founded.`);
    }
}
