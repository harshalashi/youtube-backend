class APiResponse {
  constructor(statusCode, data, message = "Success") {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.success = statusCode < 400;
  }
}

//All about status code:
/* Informational responses 100-199
Successful responses 200-299
Redirects 300-399
Client errors 400-499
Server errors 500-599 */
