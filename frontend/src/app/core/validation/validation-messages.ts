import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export const VALIDATION_LIMITS = {
  emailMaxLength: 254,
  passwordMinLength: 8,
  bcryptPasswordMaxBytes: 72,
  usernameMinLength: 3,
  usernameMaxLength: 30,
  urlMaxLength: 2048,
  movieTitleMaxLength: 200,
  movieOverviewMaxLength: 2000,
};

export const VALIDATION_MESSAGES = {
  invalidRequest: 'Please check the highlighted fields.',

  emailRequired: 'Email is required.',
  emailInvalid: 'Enter a valid email address.',
  emailMaxLength: `Email must be ${VALIDATION_LIMITS.emailMaxLength} characters or fewer.`,

  passwordRequired: 'Password is required.',
  passwordMinLength: `Password must be at least ${VALIDATION_LIMITS.passwordMinLength} characters.`,
  passwordMaxBytes: `Password must be ${VALIDATION_LIMITS.bcryptPasswordMaxBytes} bytes or fewer so bcrypt can hash every character.`,

  usernameRequired: 'Username is required.',
  usernameMinLength: `Username must be at least ${VALIDATION_LIMITS.usernameMinLength} characters.`,
  usernameMaxLength: `Username must be ${VALIDATION_LIMITS.usernameMaxLength} characters or fewer.`,
  noHtml: 'This field cannot contain angle brackets.',

  urlInvalid: 'Enter a valid http or https URL.',
  urlMaxLength: `URL must be ${VALIDATION_LIMITS.urlMaxLength} characters or fewer.`,

  movieTitleRequired: 'Title is required.',
  movieTitleMaxLength: `Title must be ${VALIDATION_LIMITS.movieTitleMaxLength} characters or fewer.`,
  movieYearInvalid: 'Year must be a valid movie release year.',
  movieDurationInvalid: 'Duration must be a positive whole number.',
  moviePosterUrlInvalid: 'Poster URL must be a valid http or https URL.',
  movieOverviewMaxLength: `Overview must be ${VALIDATION_LIMITS.movieOverviewMaxLength} characters or fewer.`,
};

export function utf8ByteLength(value: string): number {
  return new TextEncoder().encode(value).length;
}

export function maxUtf8Bytes(maxBytes: number): ValidatorFn {
  return (control: AbstractControl<string | null>): ValidationErrors | null => {
    const value = control.value ?? '';
    return utf8ByteLength(value) <= maxBytes ? null : { maxUtf8Bytes: { maxBytes } };
  };
}

export function noAngleBrackets(): ValidatorFn {
  return (control: AbstractControl<string | null>): ValidationErrors | null => {
    const value = control.value ?? '';
    return /[<>]/.test(value) ? { noHtml: true } : null;
  };
}

export function optionalHttpUrl(): ValidatorFn {
  return (control: AbstractControl<string | null>): ValidationErrors | null => {
    const value = (control.value ?? '').trim();
    if (!value) return null;

    try {
      const url = new URL(value);
      return url.protocol === 'http:' || url.protocol === 'https:' ? null : { url: true };
    } catch {
      return { url: true };
    }
  };
}

export function validationMessage(
  control: AbstractControl<unknown>,
  field: 'email' | 'password' | 'username' | 'profileImageUrl' | 'title' | 'year' | 'duration' | 'posterUrl' | 'overview'
): string {
  const errors = control.errors;
  if (!errors) return '';

  if (typeof errors['api'] === 'string') return errors['api'];

  if (field === 'email') {
    if (errors['required']) return VALIDATION_MESSAGES.emailRequired;
    if (errors['email']) return VALIDATION_MESSAGES.emailInvalid;
    if (errors['maxlength']) return VALIDATION_MESSAGES.emailMaxLength;
  }

  if (field === 'password') {
    if (errors['required']) return VALIDATION_MESSAGES.passwordRequired;
    if (errors['minlength']) return VALIDATION_MESSAGES.passwordMinLength;
    if (errors['maxUtf8Bytes']) return VALIDATION_MESSAGES.passwordMaxBytes;
  }

  if (field === 'username') {
    if (errors['required']) return VALIDATION_MESSAGES.usernameRequired;
    if (errors['minlength']) return VALIDATION_MESSAGES.usernameMinLength;
    if (errors['maxlength']) return VALIDATION_MESSAGES.usernameMaxLength;
    if (errors['noHtml']) return VALIDATION_MESSAGES.noHtml;
  }

  if (field === 'profileImageUrl') {
    if (errors['maxlength']) return VALIDATION_MESSAGES.urlMaxLength;
    if (errors['url']) return VALIDATION_MESSAGES.urlInvalid;
  }

  if (field === 'title') {
    if (errors['required']) return VALIDATION_MESSAGES.movieTitleRequired;
    if (errors['maxlength']) return VALIDATION_MESSAGES.movieTitleMaxLength;
  }

  if (field === 'year') return VALIDATION_MESSAGES.movieYearInvalid;
  if (field === 'duration') return VALIDATION_MESSAGES.movieDurationInvalid;
  if (field === 'posterUrl') return VALIDATION_MESSAGES.moviePosterUrlInvalid;
  if (field === 'overview') return VALIDATION_MESSAGES.movieOverviewMaxLength;

  return VALIDATION_MESSAGES.invalidRequest;
}
