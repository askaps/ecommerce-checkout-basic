import { ApiProperty } from '@nestjs/swagger';
import { AddProductDto } from './add-product.dto';
import { Type } from 'class-transformer';
import { IsArray, ValidateNested } from 'class-validator';

export class UpdateCartDto {
  @ApiProperty({ type: [AddProductDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AddProductDto)
  products: AddProductDto[];
}
