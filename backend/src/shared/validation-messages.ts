export const VALIDATION_LIMITS = {
  emailMaxLength: 254,
  passwordMinLength: 8,
  bcryptPasswordMaxBytes: 72,
  usernameMinLength: 3,
  usernameMaxLength: 30,
  urlMaxLength: 2048,
  reviewMaxLength: 2000,
  movieTitleMaxLength: 200,
  movieOverviewMaxLength: 2000,
};

export const VALIDATION_MESSAGES = {
  invalidRequest: "Please check the highlighted fields.",
  malformedJson: "Request body must be valid JSON.",
  bodyTooLarge: "Request body is too large.",
  tooManyAuthAttempts: "Too many attempts. Try again in a few minutes.",

  emailRequired: "Email is required.",
  emailInvalid: "Enter a valid email address.",
  emailMaxLength: `Email must be ${VALIDATION_LIMITS.emailMaxLength} characters or fewer.`,
  emailAlreadyRegistered: "Email is already registered.",

  passwordRequired: "Password is required.",
  passwordMinLength: `Password must be at least ${VALIDATION_LIMITS.passwordMinLength} characters.`,
  passwordMaxBytes: `Password must be ${VALIDATION_LIMITS.bcryptPasswordMaxBytes} bytes or fewer so bcrypt can hash every character.`,

  usernameRequired: "Username is required.",
  usernameMinLength: `Username must be at least ${VALIDATION_LIMITS.usernameMinLength} characters.`,
  usernameMaxLength: `Username must be ${VALIDATION_LIMITS.usernameMaxLength} characters or fewer.`,
  noHtml: "This field cannot contain angle brackets.",

  urlInvalid: "Enter a valid http or https URL.",
  urlMaxLength: `URL must be ${VALIDATION_LIMITS.urlMaxLength} characters or fewer.`,

  objectIdInvalid: "Invalid id.",
  statusInvalid: "Status must be planned or watched.",
  watchedAtInvalid: "Watched date must be a valid ISO date-time.",
  watchedAtStatusConflict: "Watched date can only be set when status is watched.",
  ratingInvalid: "Rating must be between 1 and 10.",
  movieRatingInvalid: "Rating must be between 0 and 10.",
  reviewInvalid: "Review must be text.",
  reviewMaxLength: `Review must be ${VALIDATION_LIMITS.reviewMaxLength} characters or fewer.`,

  movieTitleRequired: "Title is required.",
  movieTitleMaxLength: `Title must be ${VALIDATION_LIMITS.movieTitleMaxLength} characters or fewer.`,
  movieYearInvalid: "Year must be a valid movie release year.",
  movieDurationInvalid: "Duration must be a positive whole number.",
  moviePosterUrlInvalid: "Poster URL must be a valid http or https URL.",
  movieOverviewMaxLength: `Overview must be ${VALIDATION_LIMITS.movieOverviewMaxLength} characters or fewer.`,
  adultMoviesBlocked: "Adult movies are not allowed.",

  noUpdateFields: "Provide at least one field to update.",
};
