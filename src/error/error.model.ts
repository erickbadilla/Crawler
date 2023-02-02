export class AppError extends Error {
  public statusCode: number;
  public status: 'fail' | 'error';
  public isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
  }
}

export interface IAppErrorProduction {
  message: string;
  status: string;
}

export interface IAppErrorDevelopment {
  name: string;
  message: string;
  status: string;
  statusCode: number;
  stack: string;
}
