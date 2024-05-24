import { Module } from '@nestjs/common';
import { AuthModule } from '@app/auth';
import { CartsController } from './carts.controller';
import { CartsRepository } from './carts.repository';
import { CartsService } from './carts.service';
import { CouponsModule } from '../coupons/coupons.module';

@Module({
  imports: [AuthModule, CouponsModule],
  providers: [CartsRepository, CartsService],
  controllers: [CartsController],
  exports: [CartsService],
})
export class CartsModule {}
