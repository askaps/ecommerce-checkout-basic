import { ApiProperty } from '@nestjs/swagger';

export class ApiResponse<T> {
  constructor(data: T, statusCode?: number, message?: string, success = true) {
    this.success = success;
    this.data = data;
    this.statusCode = statusCode || 200;
    this.message = message;
  }

  @ApiProperty()
  success: boolean;

  @ApiProperty()
  data: T;

  @ApiProperty()
  statusCode: number;

  @ApiProperty()
  message: string;
}
