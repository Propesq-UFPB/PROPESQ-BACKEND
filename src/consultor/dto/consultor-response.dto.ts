import { ApiProperty } from '@nestjs/swagger';

export class AreaConhecimentoDto {
  @ApiProperty({ example: 345 })
  id!: number;

  @ApiProperty({ example: 'Ciências Exatas e da Terra' })
  grande_area!: string;

  @ApiProperty({
    example: 'Ciência da Computação',
    description: 'Vazio em registros de grande área.',
  })
  area!: string;

  @ApiProperty({
    example: 'Metodologia e Técnicas da Computação',
    description: 'Vazio em registros de nível superior.',
  })
  sub_area!: string;

  @ApiProperty({ example: '', description: 'Vazio em registros de nível superior.' })
  especialidade!: string;
}

export class ConsultorUsuarioDto {
  @ApiProperty({ example: 12 })
  id!: number;

  @ApiProperty({ example: 'Maria Silva' })
  nome!: string;

  @ApiProperty({ example: 'maria@exemplo.com' })
  email!: string;
}

export class ConsultorResponseDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ type: ConsultorUsuarioDto })
  usuario!: ConsultorUsuarioDto;

  @ApiProperty({ type: AreaConhecimentoDto })
  area_principal!: AreaConhecimentoDto;

  @ApiProperty({ type: [AreaConhecimentoDto] })
  areas_adicionais!: AreaConhecimentoDto[];

  @ApiProperty({ example: false })
  is_propesq!: boolean;

  @ApiProperty({ example: false })
  is_voluntario!: boolean;

  @ApiProperty({ example: false })
  is_cnpq!: boolean;

  @ApiProperty({ example: true })
  ativo!: boolean;

  @ApiProperty({ example: '2026-10-15T12:00:00.000Z' })
  criado_em!: Date;

  @ApiProperty({ example: '2026-10-15T12:00:00.000Z' })
  atualizado_em!: Date;
}

export class UsuarioElegivelDto extends ConsultorUsuarioDto {
  @ApiProperty({ example: 'COORDENADOR', description: 'Função do usuário no sistema.' })
  funcao!: string;

  @ApiProperty({
    type: AreaConhecimentoDto,
    nullable: true,
    description:
      'Área de conhecimento cadastrada no docente, usada como sugestão de área principal.',
  })
  area_conhecimento!: AreaConhecimentoDto | null;
}
