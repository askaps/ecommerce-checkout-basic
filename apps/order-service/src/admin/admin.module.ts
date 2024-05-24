import { Module } from '@nestjs/common';
import { AuthModule } from '@app/auth';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { CheckoutsModule } from '../checkouts/checkouts.module';
import { CouponsModule } from '../coupons/coupons.module';

@Module({
  imports: [AuthModule, CheckoutsModule, CouponsModule],
  providers: [AdminService],
  controllers: [AdminController],
})
export class AdminModule {}
