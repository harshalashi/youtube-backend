/* The `ApiError` class is a custom error class in JavaScript that represents an error that occurred
during an API request. */
class ApiError extends Error {
  constructor(
    statusCode,
    message = "Something went wrong",
    errors = [],
    stack = ""
  ) {
    super(message);
    this.statusCode = statusCode; // this.statusCode: Stores the HTTP status code.
    this.data = null; // this.data: Can store optional data related to the API response.
    this.message = message; // this.message: Stores the error message.
    this.success = false; // this.success: Initialized as false to indicate the API request failed.
    this.errors = errors; // this.errors: Stores the array of specific errors.

    if (stack) {
      this.stack = stack; // this.stack: Stores the stack trace, either provided or captured automatically.
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export { ApiError };
