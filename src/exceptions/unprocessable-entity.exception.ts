import { HttpException } from './http.exception';

export class UnprocessableEntityException extends HttpException {
	constructor(error) {
		super(422, error);
	}
}
