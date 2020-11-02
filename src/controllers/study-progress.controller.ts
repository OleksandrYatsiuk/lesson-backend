import { IStaticPages } from './../interfaces/pages.interface';
import * as express from 'express';
import * as mongoose from 'mongoose';
import BaseController from './base.controller';
import model from './schemas/study-progress.schema';
import lessonsModel from './schemas/lessons.schema';
import { IStudyProgress } from '../interfaces/index';
import { HttpException, NotFoundException, UnprocessableEntityException } from '../exceptions/index';
import * as e from 'express';

export class StudyProgressController extends BaseController {
    public path = '/study-progress';
    public model: mongoose.PaginateModel<IStudyProgress & mongoose.Document>;
    public lessonsModel = lessonsModel;
    constructor() {
        super();
        this.initializeRoutes();
        this.model = model;
    }

    private initializeRoutes(): void {
        this.router.patch(`${this.path}/:id`, this.update);
        this.router.get(`${this.path}/`, this.getList);
        this.router.get(`${this.path}/progress/:id`, this.progress);
        this.router.post(`${this.path}/add`, this.add);
    }


    private progress = (request: express.Request, response: express.Response, next: express.NextFunction) => {
        const { id } = request.params;
        const { courseId } = request.query;
        const filter = { userId: id };
        if (courseId) {
            filter['courseId'] = courseId;
        }
        this.model.find(filter)
            .populate('courseId', 'name').populate('lessonId', 'name')
            .sort({ courseId: 'asc', progress: 'desc' })
            .then(result => response.status(200).json({ result }))
            .catch(err => next(new HttpException(500, err)));
    }

    private getList = (request: express.Request, response: express.Response, next: express.NextFunction): void => {
        const data = request.query;
        const queryParam = JSON.parse(JSON.stringify(data));
        delete queryParam['page'];
        delete queryParam['limit'];

        this.model.find(queryParam).populate('courseId', 'name')
            .populate('userId')
            .populate('lessonId', 'name')
            .then(result => console.log(result))
        this.model.paginate(queryParam, { page: +data.page || 1, limit: +data.limit || 20 })
            .then(({ docs, total, limit, page, pages }) => {
                response.status(200).json({ result: docs.map(study => this.parseModel(study)) });
            })
            .catch(err => response.status(422).json({ result: err.message || err }));
    }

    private add = (request: express.Request, response: express.Response, next: express.NextFunction): void => {
        const { courseId, userId }: Partial<IStudyProgress> = request.body;

        this.model.exists({ userId, courseId }).then(exist => {
            if (!exist) {
                this.lessonsModel.find({ courseId })
                    .then(lessons => {
                        if (lessons.length > 0) {
                            const data: Partial<IStudyProgress> = lessons.map(lessonId => ({ courseId, userId, lessonId }))
                            this.model.insertMany(data)
                                .then(result => response.status(200).json({ result }))
                                .catch(err => response.status(422).json({ result: err.message || err }));
                        } else {
                            response.status(200).json({})
                        }
                    })
            } else {
                response.status(422).json({ result: [{ field: 'courseId', message: 'Course is already available!' }] })
            }
        })
    }


    private update = (request: express.Request, response: express.Response, next: express.NextFunction): void => {
        const { id } = request.params
        const data: Partial<IStudyProgress> = request.body
        this.model.findByIdAndUpdate(id, { ...data, updatedAt: Date.now() }, { new: true })
            .then(study => response.status(200).json({ result: this.parseModel(study) }))
            .catch(err => response.status(422).json({ result: err.message || err }));
    }



    private parseModel(study: IStudyProgress) {
        return {
            id: study._id,
            userId: study.userId,
            lessonId: study.lessonId,
            status: study.status,
            createdAt: study.createdAt,
            updatedAt: study.updatedAt
        }
    }
}