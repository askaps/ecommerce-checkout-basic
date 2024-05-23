import { Module } from '@nestjs/common';
import { AuthModule } from '@app/auth';
import { CartsController } from './carts.controller';
import { CartsRepository } from './carts.repository';
import { CartsService } from './carts.service';

@Module({
  imports: [AuthModule],
  providers: [CartsRepository, CartsService],
  controllers: [CartsController],
})
export class CartsModule {}
