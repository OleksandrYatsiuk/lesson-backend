import * as express from 'express';
import * as cron from 'node-cron';
import * as mongoose from 'mongoose';
import BaseController from './base.controller';
import model from './schemas/users.schema';
import { hashSync, compareSync } from 'bcrypt';
import { InsertProgress } from './actions/study-progress/insert-progress.action';
import studyProgressModel from './schemas/study-progress.schema';
import { User } from '../interfaces/index'
import { Telegram } from 'telegraf';


export class UsersController extends BaseController {
    public path = '/users';
    public model: mongoose.PaginateModel<User & mongoose.Document>;
    public studyProgressHelper = new InsertProgress(studyProgressModel);
    public bot = new Telegram(process.env.BOT_TOKEN);
    constructor() {
        super();
        this.initializeRoutes();
        this.model = model;
    }

    private initializeRoutes(): void {
        this.router.get(`${this.path}`, this.getList);
        this.router.post(`${this.path}/login`, this.login);
        this.router.post(`${this.path}/register`, this.register);
        this.router.post(`${this.path}/start`, this.start);
        this.router.post(`${this.path}/code`, this.generateCode)
        this.router.post(`${this.path}/code-check`, this.codeCheck)
        this.router.patch(`${this.path}/current`, this.update);
        this.router.get(`${this.path}/user`, this.geItem);
        this.router.delete(`${this.path}/:id`, this.removeItem);
    }

    private register = (request: express.Request, response: express.Response, next: express.NextFunction): void => {
        const data: User = request.body;
        this.model.exists({ phone: data.phone })
            .then(exist => {
                if (!exist) {
                    this.model.create(data)
                        .then(user => {
                            this.studyProgressHelper.insertMany(user._id, user.chat_id)
                                .then(() => this.send200(response, this.parseModel(user)))
                        })
                        .catch(err => next(this.send422([{ field: 'phone', message: err.message }])))
                } else {
                    this.model.findOne({ phone: data.phone })
                        .then(user => this.send200(response, this.parseModel(user)));
                }
            })
    };
    private login = (request: express.Request, response: express.Response, next: express.NextFunction): void => {
        const { password, phone } = request.body;
        this.model.findOne({ phone: phone.slice(phone.length - 10) })
            .then(user => {
                if (user && compareSync(password, user.passwordHash)) {
                    const token = hashSync(password, 10)
                    this.model.findByIdAndUpdate(user._id, { accessToken: token }, { new: true })
                        .then(user => {
                            this.send200(response, {
                                token: user.accessToken
                            })
                        })
                } else {
                    next(this.send422(this.custom('phone', this.validator.CREDENTIALS_INVALID)))
                }
            })
            .catch(e => this.send500(e.message | e))
    };


    private update = (request: express.Request, response: express.Response, next: express.NextFunction): void => {
        const data: User = request.body;
        this.model.findOneAndUpdate({ phone: data.phone }, { ...data, updatedAt: Date.now() }, { new: true })
            .then(user => this.send200(response, this.parseModel(user)))
            .catch(err => next(this.send500(err.message || err)))
    }

    private getList = (request: express.Request, response: express.Response, next: express.NextFunction): void => {
        const data = request.params;
        this.model.paginate({}, { page: +data.page || 1, limit: +data.limit || 20 })
            .then(({ docs, total, limit, page, pages }) => {
                this.send200Data(response, { total, limit, page, pages }, docs.map(user => this.parseModel(user)))
            })
            .catch(err => next(this.send500(err.message || err)))
    }

    private geItem = (request: express.Request, response: express.Response, next: express.NextFunction): void => {
        const data = request.query;
        this.model.findOne(data)
            .then(user => {
                if (user) {
                    this.send200(response, this.parseModel(user))
                } else {
                    next(this.send404('User'));
                }
            })
            .catch(err => next(this.send500(err.message || err)))
    }

    private removeItem = (request: express.Request, response: express.Response, next: express.NextFunction): void => {
        const { id } = request.params
        this.studyProgressHelper.deleteMany(id)
            .then(() => {
                this.model.findByIdAndDelete(id)
                    .then(user => this.send204(response))
                    .catch(err => next(this.send422(err.message || err)))
            })
    }

    private generateCode = (request: express.Request, response: express.Response, next: express.NextFunction): void => {
        const { phone } = request.body;
        const code = this.getRandomInt(1000, 9999);

        this.model.findOneAndUpdate({ phone: phone.slice(phone.length - 10) }, { code, updatedAt: Date.now() }, { new: true })
            .then(user => {
                this.bot.sendMessage(user.chat_id,
                    `Код активації для заняття: *${code}*. \nДійсний протягом 30хв або до моменту повторної генерації`, { parse_mode: 'Markdown' })

                let i = 0;
                const task = cron.schedule('*/30 * * * *', () => {
                    if (i > 0) {
                        this.model.findByIdAndUpdate(user.id, { code: null, updatedAt: Date.now() }, { new: true })
                            .then(result => { })
                        task.stop();
                    }
                    i++;
                })
                this.send200(response, this.parseModel(user))
            })
            .catch(err => next(this.send422(err.message || err)))
    }

    private codeCheck = (request: express.Request, response: express.Response, next: express.NextFunction): void => {
        const { phone, code } = request.body;
        this.model.exists({ phone: phone.slice(phone.length - 10), code })
            .then(exist => {
                if (exist) {
                    this.send200(response, true)
                } else {
                    next(this.send422(this.custom('code', this.validator.CODE_WRONG)));
                }
            })
    }

    private start = (request: express.Request, response: express.Response, next: express.NextFunction): void => {
        const param = request.params
        const { lessonId } = request.body
        this.model.findOneAndUpdate(param, { $push: { lessons: lessonId } })
            .then(user => this.send200(response, null))
            .catch(err => next(this.send422(err.message || err)))
    }

    private parseModel(user: User): Partial<User> {
        return {
            id: user._id,
            phone: user.phone,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            chat_id: user.chat_id,
            courses: user.courses,
            code: user.code,
            haveMessages: user.haveMessages,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        }
    }
    private getRandomInt(min: number, max: number): number {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
}