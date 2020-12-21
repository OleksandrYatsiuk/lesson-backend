import { ECourseStatus } from '../../interfaces';
import { BaseValidator } from './base.validator'

export default class LessonValidator extends BaseValidator {

    public lesson = this.schema({
        name: this.val.string().required().label('Назва'),
        context: this.val.string().optional().allow("").label('Опис'),
        presentation: this.val.string().optional().allow("").label('Презентація'),
        video: this.val.string().optional().allow("").label('Відео'),
        file: this.val.string().optional().allow("").label('Файл'),
        courseId: this.val.string().label('Курс Id'),
        free: this.val.boolean().label('Безкоштовний'),
        status: this.val.number().required().valid(ECourseStatus.DRAFT, ECourseStatus.PUBLISHED).label('Статус'),
    });
}



