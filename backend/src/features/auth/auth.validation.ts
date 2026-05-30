import Joi from "joi";

import { validateBody, validatePasswordByteLength } from "../../shared/joi-validation";
import { VALIDATION_LIMITS, VALIDATION_MESSAGES } from "../../shared/validation-messages";

export interface ValidRegisterRequest {
  email: string;
  password: string;
  username?: string;
}

export interface ValidLoginRequest {
  email: string;
  password: string;
}

const passwordSchema = Joi.string()
  .required()
  .min(VALIDATION_LIMITS.passwordMinLength)
  .custom((value, helpers) => {
    if (!validatePasswordByteLength(value)) {
      return helpers.error("password.maxBytes");
    }

    return value;
  })
  .messages({
    "any.required": VALIDATION_MESSAGES.passwordRequired,
    "string.base": VALIDATION_MESSAGES.passwordRequired,
    "string.empty": VALIDATION_MESSAGES.passwordRequired,
    "string.min": VALIDATION_MESSAGES.passwordMinLength,
    "password.maxBytes": VALIDATION_MESSAGES.passwordMaxBytes,
  });

const emailSchema = Joi.string()
  .required()
  .trim()
  .lowercase()
  .email({ tlds: { allow: false } })
  .max(VALIDATION_LIMITS.emailMaxLength)
  .messages({
    "any.required": VALIDATION_MESSAGES.emailRequired,
    "string.base": VALIDATION_MESSAGES.emailRequired,
    "string.empty": VALIDATION_MESSAGES.emailRequired,
    "string.email": VALIDATION_MESSAGES.emailInvalid,
    "string.max": VALIDATION_MESSAGES.emailMaxLength,
  });

const usernameSchema = Joi.string()
  .trim()
  .allow("")
  .min(VALIDATION_LIMITS.usernameMinLength)
  .max(VALIDATION_LIMITS.usernameMaxLength)
  .pattern(/^[^<>]*$/)
  .optional()
  .messages({
    "string.base": VALIDATION_MESSAGES.usernameRequired,
    "string.min": VALIDATION_MESSAGES.usernameMinLength,
    "string.max": VALIDATION_MESSAGES.usernameMaxLength,
    "string.pattern.base": VALIDATION_MESSAGES.noHtml,
  });

const registerSchema = Joi.object<ValidRegisterRequest>({
  email: emailSchema,
  password: passwordSchema,
  username: usernameSchema,
});

const loginSchema = Joi.object<ValidLoginRequest>({
  email: emailSchema,
  password: passwordSchema,
});

export function validateRegisterBody(body: unknown): ValidRegisterRequest {
  const value = validateBody<ValidRegisterRequest>(registerSchema, body);
  const username = value.username?.trim();

  return {
    email: value.email,
    password: value.password,
    ...(username ? { username } : {}),
  };
}

export function validateLoginBody(body: unknown): ValidLoginRequest {
  return validateBody<ValidLoginRequest>(loginSchema, body);
}
