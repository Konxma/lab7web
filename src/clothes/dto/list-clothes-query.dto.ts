import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';
export class PaginationQueryDto {
  @Type(() => Number) @IsInt() @Min(1) @Max(1000000) page: number = 1;
  @Type(() => Number) @IsInt() @Min(1) @Max(100) limit: number = 10;
  @IsOptional() @IsString() @MaxLength(150) search?: string;
  @IsIn(['createdAt', 'title', 'price']) sortBy: 'createdAt' | 'title' | 'price' = 'createdAt';
  @IsIn(['ASC', 'DESC']) order: 'ASC' | 'DESC' = 'DESC';
}
