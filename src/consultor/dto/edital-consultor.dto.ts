import { ApiProperty } from '@nestjs/swagger';
import { ArrayUnique, IsArray, IsInt } from 'class-validator';
import { ConsultorResponseDto } from './consultor-response.dto';

export class SetEditalConsultoresDto {
  @ApiProperty({
    type: [Number],
    example: [1, 2, 3],
    description: 'Conjunto completo de consultores vinculados ao edital.',
  })
  @IsArray({ message: 'consultor_ids deve ser uma lista.' })
  @ArrayUnique({ message: 'Os consultores não podem se repetir.' })
  @IsInt({ each: true, message: 'Cada consultor_id deve ser um número inteiro.' })
  consultor_ids!: number[];
}

export class AddEditalConsultorDto {
  @ApiProperty({ example: 1 })
  @IsInt({ message: 'O consultor_id deve ser um número inteiro.' })
  consultor_id!: number;
}

export class EditalConsultorResponseDto extends ConsultorResponseDto {
  @ApiProperty({ example: 4, description: 'Projetos atribuídos ao consultor neste edital.' })
  carga!: number;

  @ApiProperty({ example: '2026-10-15T12:00:00.000Z' })
  vinculado_em!: Date;
}
