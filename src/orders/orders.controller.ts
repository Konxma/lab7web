import { Body, Controller, Get, Post, Res } from '@nestjs/common';
import type { Response } from 'express';
import { RequestIdService } from '../shared/request-id.service';
import { RequestTraceService } from '../shared/request-trace.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderEntity } from './order.entity';
import { OrdersService } from './orders.service';

@Controller('orders')
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly requestId: RequestIdService,
    private readonly requestTrace: RequestTraceService,
  ) {}

  private trace(response: Response): void {
    response.setHeader('X-Request-Id', this.requestId.id);
    response.setHeader('X-Request-Trace-Match', String(this.requestId.id === this.requestTrace.getId()));
  }

  @Post()
  create(@Body() dto: CreateOrderDto, @Res({ passthrough: true }) response: Response): Promise<OrderEntity> {
    this.trace(response);
    return this.ordersService.createOrder(dto);
  }

  @Get()
  findAll(@Res({ passthrough: true }) response: Response): OrderEntity[] {
    this.trace(response);
    return this.ordersService.findAll();
  }
}
