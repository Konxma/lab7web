import { Body, Controller, Delete, Get, Header, HttpCode, Param, Patch, Post, ParseUUIDPipe, Query, Res } from '@nestjs/common';
import type { Response } from 'express';
import { RequestIdService } from '../shared/request-id.service';
import { RequestTraceService } from '../shared/request-trace.service';
import { ClothesService } from './clothes.service';
import { ClothingEntity } from './clothing.entity';
import { CreateClothingDto } from './dto/create-clothing.dto';
import { UpdateClothingDto } from './dto/update-clothing.dto';
import { PaginationQueryDto } from './dto/list-clothes-query.dto';

@Controller('clothes')
export class ClothesController {
  constructor(
    private readonly clothesService: ClothesService,
    private readonly requestId: RequestIdService,
    private readonly requestTrace: RequestTraceService,
  ) {}

  private trace(response: Response): void {
    response.setHeader('X-Request-Id', this.requestId.id);
    response.setHeader('X-Request-Trace-Match', String(this.requestId.id === this.requestTrace.getId()));
  }

  @Get()
  @Header('X-API-Version', '1.0')
  @Header('X-Service-Status', 'operational')
  findAll(
    @Query() query: PaginationQueryDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    this.trace(response);
    if (query.limit !== undefined) {
      response.setHeader('X-Limit-Type', typeof query.limit);
      response.setHeader('X-Applied-Limit', String(query.limit));
    }
    return this.clothesService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string, @Res({ passthrough: true }) response: Response): Promise<ClothingEntity> {
    this.trace(response);
    return this.clothesService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateClothingDto, @Res({ passthrough: true }) response: Response): Promise<ClothingEntity> {
    this.trace(response);
    return this.clothesService.create(dto);
  }

  @Patch(':id')
  update(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() dto: UpdateClothingDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<ClothingEntity> {
    this.trace(response);
    return this.clothesService.update(id, dto);
  }

  @Patch(':id/restore')
  restore(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return this.clothesService.restore(id);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string, @Res({ passthrough: true }) response: Response): Promise<void> {
    this.trace(response);
    return this.clothesService.remove(id);
  }
}
