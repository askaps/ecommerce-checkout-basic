import { ApiProperty } from '@nestjs/swagger';
import { AddProductDto } from './add-product.dto';

export class UpdateCartDto {
  @ApiProperty({ type: [AddProductDto] })
  products: AddProductDto[];
}
