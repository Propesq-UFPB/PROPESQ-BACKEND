import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsInt } from 'class-validator';

export class PaginatedDto<TData> {
  @ApiProperty()
  @IsInt({ message: 'O total deve ser um número inteiro' })
  total: number;

  @ApiProperty()
  @IsInt({ message: 'O limite deve ser um número inteiro' })
  limit: number;

  @ApiProperty()
  @IsInt({ message: 'O offset deve ser um número inteiro' })
  offset: number;

  @ApiProperty({ type: 'array' })
  @IsArray({ message: 'Os resultados devem ser um array' })
  results: TData[];
}
