import * as express from 'express';
import * as mongoose from 'mongoose';
import BaseController from "./base.controller";
import model from './schemas/courses.schema';
import { Course } from '../interfaces/index'
import CourseValidator from '../validation/controllers/course.validator';

export class CoursesController extends BaseController {
    public path = '/courses';
    public model: mongoose.PaginateModel<Course & mongoose.Document>;
    private customValidator = new CourseValidator()
    constructor() {
        super();
        this.initializeRoutes();
        this.model = model;
    }

    private initializeRoutes(): void {
        this.router.get(`${this.path}`, this.getList);
        this.router.post(`${this.path}`, super.validate(this.customValidator.course), this.create);
        this.router.patch(`${this.path}/:id`, super.validate(this.customValidator.course), this.update);
        this.router.get(`${this.path}/:id`, this.geItem);
        this.router.delete(`${this.path}/:id`, this.removeItem);
    }
    private create = (request: express.Request, response: express.Response, next: express.NextFunction): void => {
        const data: Course = request.body;
        this.model.exists({ name: data.name })
            .then(exist => {
                if (!exist) {
                    this.model.create(data)
                        .then(user => this.send200(response, this.parseModel(user)))
                        .catch(err => next(this.send422([{ field: 'name', message: err.message }])))
                } else {
                    next(this.send422(this.custom('name', this.validator.REQUIRED_INVALID, [{ value: data.name }])))
                }
            })
    };


    private getList = (request: express.Request, response: express.Response, next: express.NextFunction): void => {
        const data = request.params;
        this.model.paginate({}, { page: +data.page || 1, limit: +data.limit || 20 })
            .then(({ docs, total, limit, page, pages }) => this.send200Data(response, { limit, page, pages, total },
                docs.map(course => this.parseModel(course))))
            .catch(err => next(this.send422([{ field: 'name', message: err.message }])))
    }

    private geItem = (request: express.Request, response: express.Response, next: express.NextFunction): void => {
        const { id } = request.params;
        this.model.findById(id)
            .then(course => this.send200(response, this.parseModel(course)))
            .catch(err => next(this.send404('Course')));
    }

    private update = (request: express.Request, response: express.Response, next: express.NextFunction): void => {
        const { id } = request.params;
        const data = request.body;
        this.model.findByIdAndUpdate(id, { ...data, updatedAt: Date.now() }, { new: true })
            .then(course => this.send200(response, this.parseModel(course)))
            .catch(err => next(this.send404('Course')))
    }

    private removeItem = (request: express.Request, response: express.Response, next: express.NextFunction): void => {
        const { id } = request.params
        this.model.findByIdAndDelete(id)
            .then(() => this.send204(response))
            .catch(err => next(this.send404('Course')))
    }

    private parseModel(course: Course): Partial<Course> {
        return {
            id: course._id,
            name: course.name,
            description: course.description,
            status: course.status,
            price: course.price,
            createdAt: course.createdAt,
            updatedAt: course.updatedAt
        }
    }
}