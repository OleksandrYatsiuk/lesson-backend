import { payments } from './schenes/payments';
import Telegraf from 'telegraf';
import { Markup, Extra, Stage, session } from 'telegraf';
import { TelegrafContext } from 'telegraf/typings/context';
import { Message } from 'telegraf/typings/telegram-types';
import { ApiHelperService } from './request-helper';
import { courses_lesson } from './schenes/lesson';
import { about, result } from './storage/texts';
export const bot = new Telegraf(process.env.BOT_TOKEN);


const backend = new ApiHelperService(process.env.BACKEND_URL)

bot.catch((err, ctx) => {
    console.log(`Ooops, encountered an error for ${ctx.updateType}`, err)
})
bot.telegram.deleteWebhook()
    .then(success => {
        success && console.log('🤖 is listening to your commands');
        bot.startPolling();
    });

bot.start((ctx: TelegrafContext & { startPayload: string }) => {
    if (ctx.startPayload) {
        backend.updateUser({
            phone: ctx.startPayload, chat_id: ctx.chat.id,
            firstName: ctx.chat.first_name, lastName: ctx.chat.last_name
        })
    }
    return ctx.reply('Main menu', Markup
        .keyboard([
            ['🔍 Про нас', '👨‍🎓 Курси'],
            ['☸ Результати', '📞 Контакти'],
            ['💰 Оплата']
        ])
        .oneTime()
        .resize()
        .extra())
})

bot.hears('🔍 Про нас', (ctx: TelegrafContext): Promise<Message> => {
    return ctx.replyWithMarkdown(about);
})
bot.hears('☸ Результати', (ctx: TelegrafContext): Promise<Message> => {
    return ctx.reply(result);
})
bot.hears('👨‍🎓 Курси', (ctx: TelegrafContext) => {
    backend.courseList().then(courses => {
        return ctx.reply('Виберіть курс', Extra.HTML().markup((m) =>
            m.inlineKeyboard([
                courses.map(course => m.callbackButton(course.name, `course:${course.id}`))
            ])));
    })
})

bot.hears('💰 Оплата', (ctx: TelegrafContext) => {
    backend.courseList().then(courses => {
        return ctx.reply('Виберіть курс', Extra.HTML().markup((m) =>
            m.inlineKeyboard([
                courses.map(course => m.callbackButton(course.name, `payments:${course.id}`))
            ])));
    })
});

bot.hears('📞 Контакти', (ctx): Promise<Message> => {
    return ctx.replyWithMarkdown(`Open: [Контакти](${process.env.FRONTEND_URL})`);
})

const stage = new Stage([courses_lesson, payments]);

bot.use(session());
bot.use(stage.middleware());



bot.action(/course/, (ctx: any) => {
    return ctx.scene.enter('lessons');
});
bot.action(/payments/, (ctx: any) => {
    console.log(ctx)
    return ctx.scene.enter('payments');
});
bot.launch();