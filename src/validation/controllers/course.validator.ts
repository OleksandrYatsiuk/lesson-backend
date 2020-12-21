import { ECourseStatus } from '../../interfaces';
import { BaseValidator } from './base.validator'

export default class CourseValidator extends BaseValidator {

    public course = this.schema({
        name: this.val.string().required().label('Назва'),
        status: this.val.number().required().valid(ECourseStatus.DRAFT, ECourseStatus.PUBLISHED).label('Статус'),
        price: this.val.number().min(0).required().label('Ціна'),
        description: this.val.string().optional().allow("").label('Опис'),
    });
}



