export class customError extends Error {
  constructor(public status: number, public errorMsg: string) {
    super(errorMsg);
    this.status = status;
    this.errorMsg = errorMsg;
  }
}

export class internalError extends customError {
  constructor() {
    super(500, "Internal server error");
  }
}
