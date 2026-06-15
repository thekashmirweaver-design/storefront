export class CommerceConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CommerceConfigError";
  }
}

export class CommerceNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CommerceNotFoundError";
  }
}

export class CommerceNotImplementedError extends Error {
  constructor(method: string) {
    super(`Commerce method not implemented: ${method}`);
    this.name = "CommerceNotImplementedError";
  }
}
