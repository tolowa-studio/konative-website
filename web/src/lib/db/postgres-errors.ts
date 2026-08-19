export class PostgresDatabaseUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PostgresDatabaseUnavailableError";
  }
}
