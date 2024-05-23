import { Module } from '@nestjs/common';
import { AuthModule } from '@app/auth';
import { CheckoutsController } from './checkouts.controller';
import { CheckoutsRepository } from './checkouts.repository';
import { CheckoutsService } from './checkouts.service';
import { CartsModule } from '../carts/carts.module';

@Module({
  imports: [AuthModule, CartsModule],
  providers: [CheckoutsRepository, CheckoutsService],
  controllers: [CheckoutsController],
})
export class CheckoutsModule {}
