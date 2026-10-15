import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class RecusaAtribuicaoDto {
  @ApiProperty({ example: 'Conflito de interesse com o coordenador do projeto.' })
  @IsNotEmpty({ message: 'Informe o motivo da recusa.' })
  @IsString({ message: 'O motivo deve ser um texto.' })
  @MaxLength(1000, { message: 'O motivo deve ter no máximo 1000 caracteres.' })
  motivo!: string;
}
