import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CategoriaFuncaoProjeto } from '@prisma/client';

export class ProjectRoleResponseDto {
  @ApiProperty({ example: 1, description: 'Identificador único da função de projeto.' })
  id!: number;

  @ApiProperty({ example: 'Orientador', description: 'Nome da função.' })
  nome!: string;

  @ApiPropertyOptional({
    example: 'Docente responsável pela orientação do projeto.',
    description: 'Descrição opcional da função.',
  })
  descricao!: string | null;

  @ApiProperty({
    enum: CategoriaFuncaoProjeto,
    example: CategoriaFuncaoProjeto.ACADEMICO,
  })
  categoria!: CategoriaFuncaoProjeto;

  @ApiProperty({ example: true, description: 'Indica se a função está ativa.' })
  ativo!: boolean;

  @ApiProperty({ example: '2026-07-15T00:00:00.000Z', description: 'Data de criação.' })
  criado_em!: string;

  @ApiProperty({ example: '2026-07-15T00:00:00.000Z', description: 'Data da última atualização.' })
  atualizado_em!: string;
}
