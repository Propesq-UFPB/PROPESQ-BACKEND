import {
  MembroExternoFormacao,
  TipoMembroExterno,
  TipoMembroProjeto,
  TipoSexo,
} from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export enum CategoriaMembroProjeto {
  DOCENTE = 'DOCENTE',
  DISCENTE = 'DISCENTE',
  TECNICO_ADMINISTRATIVO = 'TECNICO_ADMINISTRATIVO',
  EXTERNO = 'EXTERNO',
}

export class ResearchLookupDto<T = number | string> {
  @ApiProperty({ oneOf: [{ type: 'integer' }, { type: 'string' }] })
  id!: T;

  @ApiProperty()
  name!: string;
}

export class ResearchGroupLookupDto extends ResearchLookupDto<number> {
  @ApiProperty({ type: [String] })
  linhas!: string[];
}

export class ResearchUserLookupDto extends ResearchLookupDto<number> {
  @ApiProperty()
  email!: string;

  @ApiProperty({ enum: CategoriaMembroProjeto })
  categoria!: CategoriaMembroProjeto;
}

export class ResearchMemberLookupsDto {
  @ApiProperty({ enum: TipoMembroProjeto, isArray: true })
  funcoes!: ResearchLookupDto<TipoMembroProjeto>[];

  @ApiProperty({ enum: CategoriaMembroProjeto, isArray: true })
  categorias!: ResearchLookupDto<CategoriaMembroProjeto>[];

  @ApiProperty({ enum: TipoMembroExterno, isArray: true })
  tipos_externos!: ResearchLookupDto<TipoMembroExterno>[];

  @ApiProperty({ enum: MembroExternoFormacao, isArray: true })
  formacoes_externas!: ResearchLookupDto<MembroExternoFormacao>[];

  @ApiProperty({ enum: TipoSexo, isArray: true })
  sexos!: ResearchLookupDto<TipoSexo>[];
}

export class ResearchAttachmentResponseDto {
  @ApiProperty()
  id!: number;

  @ApiProperty()
  projeto_pesquisa_id!: number;

  @ApiProperty({ example: 'application/pdf' })
  tipo!: string;

  @ApiProperty({ example: 'projeto-pesquisa.pdf' })
  nome!: string;
}
