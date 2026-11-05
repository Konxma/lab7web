import { IsEmail, IsInt, IsNotEmpty, IsString, IsUUID, Min } from 'class-validator';

export class CreateOrderDto {
  @IsString()
  @IsNotEmpty()
  @IsUUID('4')
  productId!: string;

  @IsInt()
  @Min(1)
  quantity!: number;

  @IsEmail()
  customerEmail!: string;
}
