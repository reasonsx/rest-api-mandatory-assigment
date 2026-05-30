import { AbstractControl, FormGroup } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';

export interface ApiFieldError {
  field: string;
  message: string;
}

export interface ApiErrorBody {
  message?: string;
  errors?: ApiFieldError[];
}

function isApiErrorBody(value: unknown): value is ApiErrorBody {
  return typeof value === 'object' && value !== null;
}

export function apiErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof HttpErrorResponse && isApiErrorBody(error.error)) {
    return error.error.message || error.error.errors?.[0]?.message || fallback;
  }

  return fallback;
}

export function applyApiFieldErrors<T extends Record<string, AbstractControl>>(
  form: FormGroup<T>,
  error: unknown
): void {
  if (!(error instanceof HttpErrorResponse) || !isApiErrorBody(error.error)) return;

  for (const item of error.error.errors ?? []) {
    const control = form.get(item.field);
    if (!control) continue;

    control.setErrors({ ...(control.errors ?? {}), api: item.message });
    control.markAsTouched();
  }
}

export function clearApiFieldErrors<T extends Record<string, AbstractControl>>(form: FormGroup<T>): void {
  for (const control of Object.values(form.controls)) {
    const errors = control.errors;
    if (!errors?.['api']) continue;

    const { api: _api, ...rest } = errors;
    control.setErrors(Object.keys(rest).length ? rest : null);
  }
}
