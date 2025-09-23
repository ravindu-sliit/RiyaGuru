import Joi from "joi";

export const paymentSchema = Joi.object({
  studentName: Joi.string().min(3).max(50).required(),
  courseName: Joi.string()
    .valid("Car", "Van", "Heavy Vehicle", "Light Vehicle", "Motor Bicycle", "Three Wheeler")
    .required(),
  amount: Joi.number().positive().required(),
  paymentType: Joi.string().valid("Full", "Installment").required(),
  paymentMethod: Joi.string().valid("Card", "Bank", "Cash").required(),
  slipURL: Joi.string().uri().optional(),
  cardDetails: Joi.object({
    cardNumber: Joi.string().creditCard(),
    cardHolder: Joi.string(),
    expiryDate: Joi.string().pattern(/^(0[1-9]|1[0-2])\/\d{2}$/), // MM/YY
    cvv: Joi.string().length(3).pattern(/^[0-9]+$/)
  }).optional()
});
