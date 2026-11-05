import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, IsNull, Not, Repository } from 'typeorm';
import { ClothingEntity } from './entities/clothing.entity';
import { CreateClothingDto } from './dto/create-clothing.dto';
import { UpdateClothingDto } from './dto/update-clothing.dto';
import { PaginationQueryDto } from './dto/list-clothes-query.dto';
@Injectable()
export class ClothesService {
  constructor(@InjectRepository(ClothingEntity) private readonly resourceRepo: Repository<ClothingEntity>) {}
  async create(dto: CreateClothingDto): Promise<ClothingEntity> {
    const entity = this.resourceRepo.create({ ...dto, price: dto.price.toFixed(2) });
    return this.resourceRepo.save(entity);
  }
  async findAll(query: PaginationQueryDto) {
    const { page, limit, search, sortBy, order } = query;
    const [data, total] = await this.resourceRepo.findAndCount({
      where: search ? { title: ILike(`%${search.replace(/[\\%_]/g, '\\$&')}%`) } : {},
      skip: (page - 1) * limit, take: limit,
      order: { [sortBy]: order, id: 'ASC' },
    });
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }
  async findOne(id: string): Promise<ClothingEntity> {
    const entity = await this.resourceRepo.findOneBy({ id });
    if (!entity) throw new NotFoundException(`Товар ${id} не знайдено`);
    return entity;
  }
  async update(id: string, dto: UpdateClothingDto): Promise<ClothingEntity> {
    const entity = await this.findOne(id);
    if (dto.title != null) entity.title = dto.title;
    if (dto.price != null) entity.price = dto.price.toFixed(2);
    if (dto.size != null) entity.size = dto.size;
    if (dto.material != null) entity.material = dto.material;
    if (dto.color != null) entity.color = dto.color;
    return this.resourceRepo.save(entity);
  }
  async remove(id: string): Promise<void> {
    const result = await this.resourceRepo.softDelete({ id, deletedAt: IsNull() });
    if (!result.affected) throw new NotFoundException(`Товар ${id} не знайдено`);
  }
  async restore(id: string) {
    const result = await this.resourceRepo.restore({ id, deletedAt: Not(IsNull()) });
    if (!result.affected) throw new NotFoundException(`Видалений товар ${id} не знайдено`);
    return { message: 'Сутність успішно відновлена' };
  }
}
