import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, MaxLength, Max } from 'class-validator';
import { ClothingSize } from '../clothing.entity';

export class UpdateClothingDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  title?: string;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  @Max(99999999.99)
  price?: number;

  @IsOptional()
  @IsEnum(ClothingSize)
  size?: ClothingSize;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  material?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  color?: string;
}
