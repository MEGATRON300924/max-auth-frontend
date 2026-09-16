export class ApiError extends Error {
  code: string;
  status: number;
  details?: unknown;
  requestId?: string;

  constructor(message: string, code: string, status: number, details?: unknown, requestId?: string) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
    this.details = details;
    this.requestId = requestId;
  }
}
