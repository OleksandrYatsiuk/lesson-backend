import * as express from 'express';
import * as mongoose from 'mongoose';
import BaseController from './base.controller';
import model from './schemas/certificate.schema';
import { Certificate } from '../interfaces/index';
import { Telegram } from 'telegraf';

export class CertificateController extends BaseController {
    public path = '/certificates';
    public bot = new Telegram(process.env.BOT_TOKEN);
    public model: mongoose.PaginateModel<Certificate & mongoose.Document>;
    constructor() {
        super();
        this.initializeRoutes();
        this.model = model;
    }

    private initializeRoutes(): void {
        this.router.get(`${this.path}`, this.getList);
        this.router.post(`${this.path}`, this.create);
        this.router.delete(`${this.path}/:id`, this.remove);
        this.router.put(`${this.path}/:id`, this.refreshFile);
    }

    private getList = (request: express.Request, response: express.Response, next: express.NextFunction): void => {
        const data = request.query;
        const queryParam = JSON.parse(JSON.stringify(data));
        delete queryParam['page'];
        delete queryParam['limit'];

        this.model.paginate(queryParam, { page: +data.page || 1, limit: +data.limit || 20 })
            .then(({ docs, total, limit, page, pages }) =>
                this.send200Data(response, { total, limit, page, pages }, docs.map(certificate => this.parseModel(certificate)))
            )
            .catch(err => next(this.send500(err.message || err)));
    }

    private create = (request: express.Request, response: express.Response, next: express.NextFunction): void => {
        const body: Certificate = request.body;
        this.bot.getFileLink(body.fileId).then(link => {
            body.fileLink = link;
            this.model.create(body)
                .then(result => this.send200(response, this.parseModel(result)))
                .catch(err => this.send500(err.message || err))
        })

    }
    private remove = (request: express.Request, response: express.Response, next: express.NextFunction): void => {
        const { id } = request.params;
        this.model.findByIdAndDelete(id)
            .then(() => this.send204(response))
            .catch(() => this.send404('Certificate'))
    }

    private refreshFile = (request: express.Request, response: express.Response, next: express.NextFunction): void => {
        const { fileId }: Partial<Certificate> = request.body;
        const { id } = request.params;
        this.bot.getFileLink(fileId)
            .then(fileLink => {
                this.model.findByIdAndUpdate(id, { $set: { fileLink } }, { new: true })
                    .then(certificate => response.status(200).json({ result: this.parseModel(certificate) }))
                    .catch(err => next(new Error(err.message)))
            })
            .catch(err => next(new Error(err.message)))
    }

    private parseModel(certificate: Certificate): Partial<Certificate> {
        return {
            id: certificate._id,
            userId: certificate.userId,
            fileId: certificate.fileId,
            fileLink: certificate.fileLink,
            createdAt: certificate.createdAt,
            updatedAt: certificate.updatedAt
        }
    }
}