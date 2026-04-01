export class FlightError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'FlightError';
  }
}
