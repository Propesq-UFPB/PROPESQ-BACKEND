import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayUnique, IsArray, IsInt } from 'class-validator';

export class SetEditalAcademicUnitsDto {
  @ApiProperty({
    type: [Number],
    example: [1, 2, 3],
    description: 'IDs das unidades acadêmicas habilitadas no edital (substitui o conjunto atual).',
  })
  @IsArray({ message: 'unidade_ids deve ser um array.' })
  @ArrayUnique({ message: 'unidade_ids não pode conter IDs duplicados.' })
  @Type(() => Number)
  @IsInt({ each: true, message: 'Cada unidade_id deve ser um número inteiro.' })
  unidade_ids!: number[];
}
