import { ApiProperty } from '@nestjs/swagger';

export class AvaliadorUsuarioDto {
  @ApiProperty({ example: 7 })
  id!: number;

  @ApiProperty({ example: 'Ana Souza' })
  nome!: string;

  @ApiProperty({ example: 'ana@exemplo.com' })
  email!: string;
}

export class AvaliadorAreaDto {
  @ApiProperty({ example: 101 })
  id!: number;

  @ApiProperty({ example: 'Ciências Exatas e da Terra' })
  grande_area!: string;

  @ApiProperty({ example: 'Ciência da Computação' })
  area!: string;

  @ApiProperty({ example: 'Teoria da Computação' })
  sub_area!: string;

  @ApiProperty({ example: 'Otimização Combinatória' })
  especialidade!: string;
}

export class AvaliadorResponseDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ type: AvaliadorUsuarioDto })
  usuario!: AvaliadorUsuarioDto;

  @ApiProperty({ type: AvaliadorAreaDto })
  area_principal!: AvaliadorAreaDto;

  @ApiProperty({ type: [AvaliadorAreaDto] })
  areas_adicionais!: AvaliadorAreaDto[];

  @ApiProperty({ example: true })
  ativo!: boolean;

  @ApiProperty({ example: false })
  is_propesq!: boolean;

  @ApiProperty({ example: true })
  is_voluntario!: boolean;

  @ApiProperty({ example: '2026-10-14T00:00:00.000Z' })
  atualizado_em!: string;
}

export class AvaliadorListResponseDto {
  @ApiProperty({ example: 42, description: 'Total de avaliadores que passam nos filtros.' })
  total!: number;

  @ApiProperty({ example: 20 })
  limit!: number;

  @ApiProperty({ example: 0 })
  offset!: number;

  @ApiProperty({ type: [AvaliadorResponseDto] })
  results!: AvaliadorResponseDto[];
}
