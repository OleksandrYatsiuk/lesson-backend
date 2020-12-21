import * as express from 'express';
import * as mongoose from 'mongoose';
import BaseController from "./base.controller";
import model from './schemas/lessons.schema';
import courseModel from './schemas/courses.schema';
import userModel from './schemas/users.schema';
import { Lesson } from '../interfaces/index'
import LessonValidator from '../validation/controllers/lesson.validator';

export class LessonsController extends BaseController {
    public path = '/lessons';
    public model: mongoose.PaginateModel<Lesson & mongoose.Document>;
    public courseModel = courseModel;
    public userModel = userModel;
    public customValidator = new LessonValidator()
    constructor() {
        super();
        this.initializeRoutes();
        this.model = model;
    }

    private initializeRoutes(): void {
        this.router.get(`${this.path}`, this.getList);
        this.router.post(`${this.path}`, super.validate(this.customValidator.lesson), this.create);
        this.router.get(`${this.path}/:id`, this.geItem);
        this.router.patch(`${this.path}/:id`, super.validate(this.customValidator.lesson), this.updateItem);
        this.router.delete(`${this.path}/:id`, this.removeItem);
    }
    private create = (request: express.Request, response: express.Response, next: express.NextFunction): void => {
        const data: Lesson = request.body;
        this.model.exists({ name: data.name })
            .then(exist => {
                if (!exist) {
                    this.model.create(data)
                        .then(user => this.send200(response, this.parseModel(user)))
                        .catch(err => next(this.send500(err?.message || err)))
                } else {
                    next(this.send422(this.custom('name', this.validator.REQUIRED_INVALID, [{ value: data.name }])))
                }
            })
    };

    private getList = (request: express.Request, response: express.Response, next: express.NextFunction): void => {
        let data = request.query;
        if (Object.keys(data).length > 0) {
            data = { courseId: data.courseId }
        }
        this.model.paginate(data, { page: +data.page || 1, limit: +data.limit || 20 })
            .then(({ docs, total, limit, page, pages }) =>
                this.send200Data(response, { limit, page, pages, total },
                    docs.map(lesson => this.parseModel(lesson))))
            .catch(err => next(this.send422(err.message)));
    }

    private geItem = (request: express.Request, response: express.Response, next: express.NextFunction): void => {
        const { id } = request.params;
        const { phone, chat_id }: any = request.query;
        this.model.findById(id)
            .then(lesson => {
                if (lesson.free) {
                    this.send200(response, this.parseModel(lesson))
                } else {
                    let params = {};
                    if (phone) {
                        params = { phone: phone.slice(phone.length - 10) }
                    }
                    if (chat_id) {
                        params = { chat_id: +chat_id };
                    }
                    this.userModel.findOne({
                        ...params, courses: { $in: [lesson.courseId] }
                    })
                        .then(user => {
                            if (user) {
                                this.send200(response, this.parseModel(lesson))
                            } else {
                                this.send403(response);
                            }
                        })
                }
            })
            .catch(err => next(this.send404('Lesson')));

    }

    private updateItem = (request: express.Request, response: express.Response, next: express.NextFunction): void => {
        const { id } = request.params;
        const data = request.body;
        this.model.findByIdAndUpdate(id, { ...data, updatedAt: Date.now() }, { new: true })
            .then(lesson => this.send200(response, this.parseModel(lesson)))
            .catch(err => next(this.send404('Lesson')));

    }

    private removeItem = (request: express.Request, response: express.Response, next: express.NextFunction): void => {
        const { id } = request.params
        this.model.findByIdAndDelete(id)
            .then(() => this.send204(response))
            .catch(err => next(this.send404('Lesson')));
    }

    private parseModel(lesson: Lesson): Partial<Lesson> {
        return {
            id: lesson._id,
            name: lesson.name,
            context: lesson.context,
            file: lesson.file,
            video: lesson.video,
            presentation: lesson.presentation,
            free: lesson.free,
            status: lesson.status,
            courseId: lesson.courseId,
            createdAt: lesson.createdAt,
            updatedAt: lesson.updatedAt
        }
    }
}