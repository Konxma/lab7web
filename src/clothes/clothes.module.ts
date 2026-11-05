import { TypeOrmModule } from '@nestjs/typeorm';
import { ClothingEntity } from './entities/clothing.entity';
import { Module } from '@nestjs/common';
import { SharedModule } from '../shared/shared.module';
import { ClothesController } from './clothes.controller';
import { ClothesService } from './clothes.service';

@Module({
  imports: [SharedModule, TypeOrmModule.forFeature([ClothingEntity])],
  controllers: [ClothesController],
  providers: [ClothesService],
  exports: [ClothesService],
})
export class ClothesModule {}
