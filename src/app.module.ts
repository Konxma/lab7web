import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClothesModule } from './clothes/clothes.module';
import { HomeModule } from './home/home.module';
import { OrdersModule } from './orders/orders.module';
import { SharedModule } from './shared/shared.module';
import { HttpLoggingMiddleware } from './common/middleware/http-logger.middleware';

@Module({
  imports: [TypeOrmModule.forRoot({
    type: 'postgres', host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT || 5432),
    username: process.env.DB_USER || 'nest_user',
    password: process.env.DB_PASSWORD || 'nest_password',
    database: process.env.DB_NAME || 'store_db',
    autoLoadEntities: true, synchronize: true,
    logging: process.env.DB_LOGGING === 'true' ? ['query', 'schema', 'error'] : ['schema', 'error'],
    retryAttempts: 2,
  }), HomeModule, SharedModule, ClothesModule, OrdersModule],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    // Nest 11 / Express 5 requires a named wildcard; braces include the root route.
    consumer.apply(HttpLoggingMiddleware).forRoutes('{*path}');
  }
}
