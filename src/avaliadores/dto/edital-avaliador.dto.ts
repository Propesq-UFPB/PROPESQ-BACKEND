import { ApiProperty } from '@nestjs/swagger';
import { ArrayUnique, IsArray, IsInt } from 'class-validator';
import { AvaliadorResponseDto } from './avaliador-response.dto';

export class SetEditalAvaliadoresDto {
  @ApiProperty({
    type: [Number],
    example: [1, 2, 3],
    description: 'Conjunto completo de avaliadores vinculados ao edital.',
  })
  @IsArray({ message: 'avaliador_cadastro_ids deve ser uma lista.' })
  @ArrayUnique({ message: 'Os avaliadores não podem se repetir.' })
  @IsInt({ each: true, message: 'Cada item de avaliador_cadastro_ids deve ser um número inteiro.' })
  avaliador_cadastro_ids!: number[];
}

export class AddEditalAvaliadorDto {
  @ApiProperty({ example: 1 })
  @IsInt({ message: 'O avaliador_cadastro_id deve ser um número inteiro.' })
  avaliador_cadastro_id!: number;
}

export class EditalAvaliadorResponseDto extends AvaliadorResponseDto {
  @ApiProperty({ example: 4, description: 'Projetos atribuídos ao avaliador neste edital.' })
  carga!: number;

  @ApiProperty({ example: '2026-10-15T12:00:00.000Z' })
  vinculado_em!: Date;
}
