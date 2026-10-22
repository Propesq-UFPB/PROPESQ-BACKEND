import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

export class DistribuicaoParamsDto {
  @ApiProperty({ description: 'Número mínimo de projetos por consultor' })
  @IsInt()
  @Min(0)
  minimoProjetosPorAvaliador: number;

  @ApiProperty({ description: 'Número máximo de projetos por consultor' })
  @IsInt()
  @Min(1)
  maximoProjetosPorAvaliador: number;

  @ApiProperty({ description: 'Número de consultores por projeto' })
  @IsInt()
  @Min(1)
  avaliadoresPorProjeto: number;
}
