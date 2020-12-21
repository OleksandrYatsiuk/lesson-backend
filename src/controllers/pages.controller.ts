import * as express from 'express';
import * as mongoose from 'mongoose';
import BaseController from './base.controller';
import model from './schemas/pages.schema';
import { IStaticPages } from '../interfaces/index'

export class PagesController extends BaseController {
    public path = '/static-pages';
    public model: mongoose.Model<IStaticPages & mongoose.Document>;

    constructor() {
        super();
        this.initializeRoutes();
        this.model = model;
    }

    private initializeRoutes(): void {
        this.router.get(`${this.path}`, this.getList);
        this.router.post(`${this.path}`, this.create);
    }
    private create = (request: express.Request, response: express.Response, next: express.NextFunction): void => {
        const data: IStaticPages = request.body;
        this.model.exists({ type: data.type }).then(exist => {
            if (exist) {
                this.model.updateOne({ type: data.type }, data)
                    .then(page => this.send200(response, this.parseModel(page)))
                    .catch(err => next(this.send422(([{ field: 'type', message: err.message }]))))
            } else {
                this.model.create(data)
                    .then(page => this.send200(response, this.parseModel(page)))
                    .catch(err => next(this.send422(([{ field: 'type', message: err.message }]))))
            }
        })

    };


    private getList = (request: express.Request, response: express.Response, next: express.NextFunction): void => {
        const data = request.query;
        this.model.find(data)
            .then((pages: IStaticPages[]) => this.send200(response, pages.map(page => this.parseModel(page))))
            .catch(err => next(this.send422([{ field: 'name', message: err.message }])))
    }

    private parseModel(page: IStaticPages): Partial<IStaticPages> {
        return {
            id: page._id,
            type: page.type,
            content: page.content,
            createdAt: page.createdAt,
            updatedAt: page.updatedAt
        }
    }
}