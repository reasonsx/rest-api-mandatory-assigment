import Joi from "joi";

import { validateBody } from "../../shared/joi-validation";
import { VALIDATION_LIMITS, VALIDATION_MESSAGES } from "../../shared/validation-messages";

export interface UserProfileUpdatePayload {
  username?: string;
  profileImageUrl?: string;
}

const profileUpdateSchema = Joi.object<UserProfileUpdatePayload>({
  username: Joi.string()
    .optional()
    .trim()
    .min(VALIDATION_LIMITS.usernameMinLength)
    .max(VALIDATION_LIMITS.usernameMaxLength)
    .pattern(/^[^<>]*$/)
    .messages({
      "any.required": VALIDATION_MESSAGES.usernameRequired,
      "string.base": VALIDATION_MESSAGES.usernameRequired,
      "string.empty": VALIDATION_MESSAGES.usernameRequired,
      "string.min": VALIDATION_MESSAGES.usernameMinLength,
      "string.max": VALIDATION_MESSAGES.usernameMaxLength,
      "string.pattern.base": VALIDATION_MESSAGES.noHtml,
    }),
  profileImageUrl: Joi.string()
    .trim()
    .allow("")
    .max(VALIDATION_LIMITS.urlMaxLength)
    .uri({ scheme: ["http", "https"] })
    .optional()
    .messages({
      "string.base": VALIDATION_MESSAGES.urlInvalid,
      "string.max": VALIDATION_MESSAGES.urlMaxLength,
      "string.uri": VALIDATION_MESSAGES.urlInvalid,
    }),
}).min(1).messages({
  "object.min": VALIDATION_MESSAGES.noUpdateFields,
});

export function validateProfileUpdateBody(body: unknown): UserProfileUpdatePayload {
  return validateBody<UserProfileUpdatePayload>(profileUpdateSchema, body);
}
