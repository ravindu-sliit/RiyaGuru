import Joi from "joi";

export const installmentSchema = Joi.object({
  studentId: Joi.string().min(2).required(),
  courseId: Joi.string().required(),
  totalAmount: Joi.number().positive().required(),
  downPayment: Joi.number().min(0).required(),
  totalInstallments: Joi.number().integer().min(1).max(12).required(),
  startDate: Joi.date().required()
});
