import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class PatchCartDto {
  @ApiProperty()
  @IsString()
  @IsOptional()
  couponCode?: string;
}
