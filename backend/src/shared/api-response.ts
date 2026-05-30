import { Response } from "express";

import { VALIDATION_MESSAGES } from "./validation-messages";

export interface ApiFieldError {
  field: string;
  message: string;
}

export interface ApiErrorBody {
  message: string;
  errors?: ApiFieldError[];
}

export class RequestValidationError extends Error {
  constructor(readonly errors: ApiFieldError[]) {
    super(VALIDATION_MESSAGES.invalidRequest);
  }
}

export function fieldError(field: string, message: string): ApiFieldError {
  return { field, message };
}

export function sendError(
  res: Response,
  status: number,
  message: string,
  errors?: ApiFieldError[]
) {
  const body: ApiErrorBody = errors?.length ? { message, errors } : { message };
  return res.status(status).json(body);
}

export function sendValidationError(res: Response, errors: ApiFieldError[]) {
  return sendError(res, 400, VALIDATION_MESSAGES.invalidRequest, errors);
}

export function sendServerError(res: Response, message = "Something went wrong.") {
  return sendError(res, 500, message);
}

