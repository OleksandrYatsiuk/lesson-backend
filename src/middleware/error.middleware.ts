import { NextFunction, Request, Response } from 'express';
import { HttpException, NotFoundException, UnprocessableEntityException } from '../exceptions/index';

export default function errorMiddleware(
    error: HttpException,
    request: Request,
    response: Response,
    next: NextFunction
) {
    const code = error.code || 500;
    const message = error.message || 'Internal Server Error';
    if (code == 404) {
        response.status(404).json({
            code: 404,
            status: 'error',
            message: 'Not Found',
            result: message
        })
    } else if (code === 422) {
        response.status(422).json({
            code: 422,
            status: 'error',
            message: 'UnprocessableEntity',
            result: message
        })
    } else {
        response.status(500).json({
            code: 500,
            status: 'error',
            message: 'Internal Server Error',
            result: message
        })
    }
}
