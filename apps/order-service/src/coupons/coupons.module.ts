import { Module } from '@nestjs/common';
import { CouponsRepository } from './coupons.repository';
import { CouponsService } from './coupons.service';

@Module({
  providers: [CouponsRepository, CouponsService],
  exports: [CouponsService],
})
export class CouponsModule {}
