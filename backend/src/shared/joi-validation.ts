import Joi from "joi";

import { fieldError, RequestValidationError } from "./api-response";

const VALIDATION_OPTIONS: Joi.ValidationOptions = {
  abortEarly: false,
  convert: true,
  errors: { wrap: { label: false } },
  stripUnknown: true,
};

export function validateBody<T>(schema: Joi.ObjectSchema<T>, body: unknown): T {
  const { error, value } = schema.validate(body ?? {}, VALIDATION_OPTIONS);

  if (!error) {
    return value as T;
  }

  const errors = new Map<string, string>();

  for (const detail of error.details) {
    const field = detail.path.join(".") || "body";
    if (!errors.has(field)) {
      errors.set(field, detail.message);
    }
  }

  throw new RequestValidationError(
    [...errors.entries()].map(([field, message]) => fieldError(field, message))
  );
}

export function validatePasswordByteLength(value: string): boolean {
  return Buffer.byteLength(value, "utf8") <= 72;
}

