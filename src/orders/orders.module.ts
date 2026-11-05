import { Module } from '@nestjs/common';
import { ClothesModule } from '../clothes/clothes.module';
import { SharedModule } from '../shared/shared.module';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';

@Module({
  imports: [ClothesModule, SharedModule],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
