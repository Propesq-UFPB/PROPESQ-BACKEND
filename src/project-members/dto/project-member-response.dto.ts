import { ApiProperty } from '@nestjs/swagger';

export class ProjectMemberResponseDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 1 })
  projeto_pesquisa_id!: number;

  @ApiProperty({ example: 1 })
  usuario_id!: number;

  @ApiProperty({ example: 1 })
  funcao_projeto_id!: number;

  @ApiProperty({ example: true })
  ativo!: boolean;

  @ApiProperty({ example: '2026-07-21T00:00:00.000Z' })
  criado_em!: string;

  @ApiProperty({ example: 'Usuario Aluno' })
  usuario_nome!: string;

  @ApiProperty({ example: 'Bolsista' })
  funcao_nome!: string;
}
