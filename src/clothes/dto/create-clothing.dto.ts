import { IsEnum, IsNotEmpty, IsNumber, IsPositive, IsString, MaxLength, Max } from 'class-validator';
import { ClothingSize } from '../clothing.entity';

export class CreateClothingDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  title!: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  @Max(99999999.99)
  price!: number;

  @IsEnum(ClothingSize)
  size!: ClothingSize;

  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  material!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  color!: string;
}
