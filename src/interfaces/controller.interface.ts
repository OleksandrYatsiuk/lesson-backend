import { Router } from 'express';
import { BaseValidator } from 'validation/controllers/base.validator';
import { ErrorMessage } from 'validation/middleware/ErrorMessage';

export interface Controller {
  path: string;
  router?: Router;
  validator: ErrorMessage,
  baseValidator: BaseValidator;
}