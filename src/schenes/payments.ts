import { BaseScene, Extra } from 'telegraf';
import { SceneContextMessageUpdate } from 'telegraf/typings/stage';

export const payments = new BaseScene('payments');

payments.enter((ctx: SceneContextMessageUpdate & { session: any }) => {

    const courseId = ctx.match.input.split(':')[1];
    return ctx.reply('Оплата курсу',
        Extra.HTML().markup((m) =>
            m.inlineKeyboard([
                m.urlButton('Перейти на сторінку оплати',
                    `${process.env.FRONTEND_URL}/payment?chat_id=${ctx.chat.id}&courseId=${courseId}`),
            ])))
})
