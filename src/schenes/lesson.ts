import { EMessageTypes, EContentTypes } from '../interfaces';
import { Markup, Extra, BaseScene } from 'telegraf';
import { SceneContextMessageUpdate } from 'telegraf/typings/stage';
import { Message } from 'telegraf/typings/telegram-types';
import { bot } from '../telegram-bot';
import { ApiHelperService } from '../request-helper';

const backend = new ApiHelperService(process.env.BACKEND_URL)
export const courses_lesson = new BaseScene('lessons');

courses_lesson.enter((ctx: SceneContextMessageUpdate & { session: any }) => {

    const courseId = ctx.match.input.split(':')[1];
    ctx.session.data = { courseId };

    backend.lessonList({ courseId })
        .then(lessons => {
            ctx.reply('Виберіть  урок', Extra.HTML().markup((m) =>
                m.inlineKeyboard([
                    lessons.map(lesson => m.callbackButton(lesson.name, `lesson:${lesson.id}`))
                ])))
        })

    courses_lesson.action(/lesson:/, (ctx: SceneContextMessageUpdate & { session: any }) => {
        const lessonId = ctx.match.input.split(':')[1];
        ctx.session.data['lesson'] = lessonId;
        backend.lessonDetail(lessonId, ctx.chat.id)
            .then(lesson => {
                ctx.replyWithHTML(lesson?.name, Extra.HTML().markup((m) =>
                    m.inlineKeyboard([
                        m.callbackButton('Надати відповідь', 'next'),
                        m.urlButton('Перейти на деталі заняття', `${process.env.FRONTEND_URL}/homework/lessons/${lessonId}?chat_id=${ctx.chat.id}`)
                    ])
                ))
            }).catch(e => {
                if (e.response.data.code === 403) {
                    return ctx.reply('У Вас немає доступу до цього уроку. \n Ви можете оплатити курс і продовжити навчання далі.', Extra.HTML().markup((m) =>
                        m.inlineKeyboard([
                            m.urlButton('Оплатити', `${process.env.FRONTEND_URL}/payment?chat_id=${ctx.chat.id}&courseId=${ctx.session.data.courseId}`),
                        ])))
                } else {
                    return ctx.reply(e.response.data.result)
                }
            })

    })
    courses_lesson.action('next', (ctx: SceneContextMessageUpdate & { session: any }) => {
        backend.getUser(ctx.chat.id).then(user => {
            ctx.session.data.userId = user.id;
            ctx.reply('Ви можете вписати результати нижче:', Markup
                .keyboard([['Завершити',]])
                .oneTime()
                .resize()
                .extra())
        })

        courses_lesson.on('message', (ctx: SceneContextMessageUpdate & { session: any }) => {
            ctx.session.data['isAddedMessage'] = true;
            const { message } = ctx.update;
            if (message.text == 'Завершити') {
                return ctx.scene.leave();
            } else {
                fetchFile(message, (content: Message) => {
                    const data: any = {
                        userId: ctx.session.data.userId,
                        lessonId: ctx.session.data.lesson,
                        type: EMessageTypes.user,
                        message: {
                            id: message.message_id,
                            content
                        },
                    }
                    backend.sendMessage(data)
                        .then(result => { })
                        .catch(e => ctx.reply(e.response.data.result));
                })
            }

        })


        courses_lesson.leave((ctx) => {
            ctx.reply('Ваша відповідь була прийнята. Найближчим часом буде зроблена перевірка і надісланий результат:)');
        });
    })
})

function fetchFile(msg: Message, cb: Function): void {
    if (msg.document) {
        getFileLink(msg.document.file_id)
            .then(link => cb({ type: EContentTypes.file, link: link, text: msg.caption, fileId: msg.document.file_id }));
    } else if (msg.photo) {
        getFileLink(msg.photo[0].file_id)
            .then(link => cb({ type: EContentTypes.photo, link: link, text: msg.caption, fileId: msg.photo[0].file_id }));
    } else {
        cb({ type: EContentTypes.text, link: null, text: msg.text, fileId: null })
    }
}

function getFileLink(fileId: string): Promise<string> {
    return bot.telegram.getFileLink(fileId);
}
