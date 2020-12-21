import { CustomMessage } from './../interfaces/messages.interface';
import * as express from 'express';
import * as mongoose from 'mongoose';
import axios from 'axios';
import BaseController from "./base.controller";
import model from './schemas/messages.schema';
import studyModel from './schemas/study-progress.schema';
import userModel from './schemas/users.schema';
import { Messages } from '../interfaces/index'
import { NotFoundException, UnprocessableEntityException } from '../exceptions/index';
import { Telegram } from 'telegraf';


export class MessagesController extends BaseController {
    public path = '/messages';
    public bot = new Telegram(process.env.BOT_TOKEN);
    public model: mongoose.PaginateModel<Messages & mongoose.Document>;
    public studyModel = studyModel;
    public userModel = userModel;
    public http = axios;
    constructor() {
        super();
        this.initializeRoutes();
        this.model = model;

    }

    private initializeRoutes(): void {
        this.router.get(`${this.path}`, this.getList);
        this.router.post(`${this.path}`, this.save);
        this.router.post(`${this.path}/message`, this.sendToUser);
        this.router.get(`${this.path}/:id`, this.geItem);
        this.router.delete(`${this.path}/:id`, this.removeItem);
        this.router.post(`${this.path}/refresh`, this.refreshFile);
    }

    private save = (request: express.Request, response: express.Response, next: express.NextFunction): void => {
        const data: Messages = request.body;

        this.studyModel.findOneAndUpdate({ lessonId: data.lessonId, userId: data.userId }, { isAnswered: false, updatedAt: Date.now() })
            .then(res => {
                this.userModel.findOneAndUpdate({ _id: data.userId }, { haveMessages: true, updatedAt: Date.now() }, { new: true })
                    .then(res => {
                        this.model.create(data)
                            .then(message => response.status(200).json({ result: this.parseModel(message) }))
                            .catch(err => next(new UnprocessableEntityException([{ field: 'name', message: err.message }])))
                    })
                    .catch(err => response.status(500).json({ result: err.message }))
            })

    };


    private getList = (request: express.Request, response: express.Response, next: express.NextFunction): void => {
        const data = request.query;
        const queryParam = JSON.parse(JSON.stringify(data));
        delete queryParam['page'];
        delete queryParam['limit'];

        this.model.paginate(queryParam, { page: +data.page || 1, limit: +data.limit || 20 })
            .then(({ docs, total, limit, page, pages }) => {
                response.status(200).json({
                    result: docs.map(course => this.parseModel(course)), pagination: {
                        page, limit, total, pages
                    }
                })
            })
            .catch(err => next(new UnprocessableEntityException([{ field: 'name', message: err.message }])))
    }

    private geItem = (request: express.Request, response: express.Response, next: express.NextFunction): void => {
        const { id } = request.params;
        this.model.findById(id)
            .then(course => response.status(200).json({ result: this.parseModel(course) }))
            .catch(err => next(new NotFoundException('Message')));
    }

    private removeItem = (request: express.Request, response: express.Response, next: express.NextFunction): void => {
        const { id } = request.params;
        this.model.findById(id).populate('userId').then(msg => {
            this.bot.deleteMessage(msg.userId['chat_id'], msg.message.id)
                .then(res => {
                    this.model.findByIdAndDelete(id)
                        .then(() => response.status(204).json());
                })
                .catch(err => {
                    this.model.findByIdAndDelete(id)
                        .then(() => response.status(200).json({ code: 200, result: 'Повідомлення було видалене з системи, але воно залишається в Telegram!' }));
                });
        })
            .catch(err => next(new NotFoundException('Message')));
    }
    private sendToUser = (request: express.Request, response: express.Response, next: express.NextFunction): void => {
        const msg: CustomMessage = request.body;
        this.studyModel.findOneAndUpdate({ lessonId: msg.lessonId, userId: msg.userId }, { isAnswered: true, updatedAt: Date.now() }, { new: true })
            .then(res => {
                if (!msg.message.content.link) {
                    this.model.create(msg)
                        .then(message => response.status(200).json({ result: this.parseModel(message) }))
                        .catch(err => next(new Error(err.message)))
                } else {
                    this.bot.getFileLink(msg.message.content.link)
                        .then(link => {
                            msg.message.content.fileId = msg.message.content.link;
                            msg.message.content.link = link;
                            this.model.create(msg)
                                .then(message => response.status(200).json({ result: this.parseModel(message) }))
                                .catch(err => next(new Error(err.message)))
                        })
                        .catch(err => next(new Error(err.message)))
                }
            })
            .catch(err => response.status(500).json({ result: err.message }))
    }
    private refreshFile = (request: express.Request, response: express.Response, next: express.NextFunction): void => {
        const { message, id }: Messages = request.body;
        this.bot.getFileLink(message.content?.fileId)
            .then(link => {
                message.content.link = link;
                this.model.findByIdAndUpdate(id, { $set: { message } }, { new: true })
                    .then(message => response.status(200).json({ result: this.parseModel(message) }))
                    .catch(err => next(new Error(err.message)))
            })
            .catch(err => next(new Error(err.message)))
    }

    private parseModel(message: Messages): Partial<Messages> {
        return {
            id: message._id,
            userId: message.userId,
            lessonId: message.lessonId,
            type: message.type,
            message: message.message,
            createdAt: message.createdAt
        }
    }
}