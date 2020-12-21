import {
    UnprocessableEntity, OK, Unauthorized, Forbidden, Created,
    NotFound, BadRequest, NoContent, InternalServerError
} from '../exceptions';
import { Response } from 'express';
import { Pagination } from '../interfaces';


export function code422(response: Response, errors: any) {
    response.status(UnprocessableEntity).json({
        code: UnprocessableEntity,
        status: 'Error',
        message: 'Unprocessable Entity',
        result: errors
    });
}

export function code200(response: Response, data?: object | string | null | any) {
    response.status(OK).json({
        code: OK,
        status: 'Success',
        message: 'OK',
        result: data
    });
}

export function code401(response: Response) {
    response.status(Unauthorized).json({
        code: Unauthorized,
        status: 'Error',
        message: 'Unauthorized',
        result: 'Your request was made with invalid credentials.'
    });
}

export function code403(response: Response) {
    response.status(Forbidden).json({
        code: Forbidden,
        status: 'Error',
        message: 'Forbidden',
        result: 'You are not allowed to perform this action.'
    });
}

export function code200DataProvider(response: Response, pagination: Pagination, data?: object[]) {
    response.status(OK).json({
        code: OK,
        status: 'Success',
        message: 'OK',
        result: data,
        _meta: { pagination }
    });
}
export function code201(response: Response, data: any) {
    response.status(Created).json({
        code: Created,
        status: 'Success',
        message: 'Created',
        result: data
    });
}

export function code404(response: Response, data: string) {
    response.status(NotFound).json({
        code: NotFound,
        status: 'Error',
        message: 'Not Found',
        result: data
    });
}

export function code400(response: Response) {
    response.status(BadRequest).json({
        code: BadRequest,
        status: 'Error',
        message: 'Bad request',
        result: 'JSON is not valid.'
    });
}

export function code204(response: Response) {
    response.status(NoContent).json();
}

export function code500(response: Response, data?: any) {
    response.status(InternalServerError).json({
        code: InternalServerError,
        status: 'Error',
        message: 'Internal Server Error',
        result: data
    });
}
