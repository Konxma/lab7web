import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { SlugService } from '../shared/slug.service';
import { ClothesService } from '../clothes/clothes.service';
import { STORE_CONFIG, StoreConfig } from '../shared/config/app-config.provider';
import { FEE_CALCULATOR, FeeCalculator } from '../shared/config/fee-calculator.provider';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderEntity } from './order.entity';

@Injectable()
export class OrdersService implements OnModuleInit {
  private readonly logger = new Logger(OrdersService.name);
  private readonly orders: OrderEntity[] = [];

  constructor(
    private readonly clothesService: ClothesService,
    private readonly slugService: SlugService,
    @Inject(STORE_CONFIG) private readonly config: StoreConfig,
    @Inject(FEE_CALCULATOR) private readonly feeCalculator: FeeCalculator,
  ) {}

  onModuleInit(): void {
    this.logger.log('Сервіс замовлень готовий до прийому замовлень.');
  }

  async createOrder(dto: CreateOrderDto): Promise<OrderEntity> {
    const product = await this.clothesService.findOne(dto.productId);
    const subtotal = Math.round(Number(product.price) * dto.quantity * 100) / 100;
    const taxAmount = this.feeCalculator.calculateTax(subtotal);
    const order: OrderEntity = {
      orderId: `ord-${randomUUID()}`,
      customerEmail: dto.customerEmail,
      productId: product.id,
      productTitle: product.title,
      productSlug: this.slugService.generateSlug(product.title),
      unitPrice: Number(product.price),
      quantity: dto.quantity,
      subtotal,
      taxAmount,
      total: Math.round((subtotal + taxAmount) * 100) / 100,
      currency: this.config.defaultCurrency,
      status: 'confirmed',
      createdAt: new Date().toISOString(),
    };
    this.orders.push(order);
    return order;
  }

  findAll(): OrderEntity[] {
    return [...this.orders];
  }
}
