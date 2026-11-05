import { ApiProperty, ApiPropertyOptional, OmitType, PartialType } from '@nestjs/swagger';
import { TitulacaoMin } from '@prisma/client';
import { Transform } from 'class-transformer';
import {
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsDateString,
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  MaxLength,
} from 'class-validator';
import { AvaliadorResponseDto } from './avaliador-response.dto';

const trim = ({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value);
const soDigitos = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.replace(/\D/g, '') : value;

export class CreateAvaliadorExternoDto {
  @ApiProperty({ example: 'Ana Souza' })
  @Transform(trim)
  @IsString()
  @IsNotEmpty({ message: 'Informe o nome do avaliador.' })
  @MaxLength(255)
  nome!: string;

  @ApiProperty({ example: 'ana.souza@ufpe.br' })
  @Transform(trim)
  @IsEmail({}, { message: 'Informe um e-mail válido.' })
  email!: string;

  @ApiProperty({ example: 'Universidade Federal de Pernambuco', description: 'Filiação.' })
  @Transform(trim)
  @IsString()
  @IsNotEmpty({ message: 'Informe a instituição (filiação) do avaliador.' })
  @MaxLength(255)
  instituicao!: string;

  @ApiPropertyOptional({ enum: TitulacaoMin, example: TitulacaoMin.DOUTORADO })
  @IsOptional()
  @IsEnum(TitulacaoMin, { message: 'Titulação inválida.' })
  titulacao?: TitulacaoMin;

  @ApiPropertyOptional({
    example: '12345678909',
    description: 'Só dígitos (pontuação é removida). Omitir para estrangeiros.',
  })
  @IsOptional()
  @Transform(soDigitos)
  @Matches(/^\d{11}$/, { message: 'O CPF deve ter 11 dígitos.' })
  cpf?: string;

  @ApiPropertyOptional({ example: 'Brasil' })
  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(100)
  pais?: string;

  @ApiPropertyOptional({ example: '+55 81 99999-0000' })
  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(30)
  telefone?: string;

  @ApiPropertyOptional({ example: 'http://lattes.cnpq.br/1234567890123456' })
  @IsOptional()
  @Transform(trim)
  @IsUrl({}, { message: 'Informe uma URL válida para o Lattes.' })
  @MaxLength(500)
  lattes_url?: string;

  @ApiPropertyOptional({ example: '0000-0002-1825-0097' })
  @IsOptional()
  @Transform(trim)
  @Matches(/^\d{4}-\d{4}-\d{4}-\d{3}[\dX]$/, { message: 'ORCID no formato 0000-0000-0000-0000.' })
  orcid?: string;

  @ApiPropertyOptional({ example: 'Indicado pela coordenação do PPG.' })
  @IsOptional()
  @IsString()
  observacao?: string;

  @ApiProperty({ example: 345, description: 'Área de conhecimento principal.' })
  @IsInt({ message: 'A área principal deve ser um número inteiro.' })
  area_principal_id!: number;

  @ApiPropertyOptional({ type: [Number], example: [346], description: 'Áreas adicionais.' })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsInt({ each: true })
  areas_adicionais_ids?: number[];

  @ApiPropertyOptional({ example: false, description: 'Bolsista de produtividade CNPq.' })
  @IsOptional()
  @IsBoolean()
  is_cnpq?: boolean;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  is_voluntario?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  ativo?: boolean;

  @ApiPropertyOptional({
    example: '2027-03-31T23:59:59.000Z',
    description: 'Validade do link de acesso gerado no cadastro. Sem valor, não expira.',
  })
  @IsOptional()
  @IsDateString({}, { message: 'link_expira_em deve ser uma data ISO 8601.' })
  link_expira_em?: string;
}

/** Áreas e flags também podem ser alteradas por PATCH /avaliadores/:id. */
export class UpdateAvaliadorExternoDto extends PartialType(
  OmitType(CreateAvaliadorExternoDto, ['link_expira_em'] as const),
) {}

export class GerarLinkDto {
  @ApiPropertyOptional({
    example: '2027-03-31T23:59:59.000Z',
    description: 'Validade do novo link. Sem valor, não expira.',
  })
  @IsOptional()
  @IsDateString({}, { message: 'expira_em deve ser uma data ISO 8601.' })
  expira_em?: string;
}

export class LinkAcessoStatusDto {
  @ApiProperty({ description: 'Há um link válido (não revogado e não expirado).' })
  ativo!: boolean;

  @ApiProperty({ nullable: true })
  criado_em!: Date | null;

  @ApiProperty({ nullable: true })
  expira_em!: Date | null;

  @ApiProperty({ nullable: true })
  ultimo_acesso_em!: Date | null;
}

export class AvaliadorExternoResponseDto extends AvaliadorResponseDto {
  @ApiProperty({ type: LinkAcessoStatusDto })
  link!: LinkAcessoStatusDto;
}

export class LinkAcessoDto {
  @ApiProperty({
    example: 'https://portal.propesq.ufpb.br/avaliacao-externa/3q2-7wZ…',
    description: 'Exibido só nesta resposta: o sistema guarda apenas o hash do token.',
  })
  url!: string;

  @ApiProperty({ nullable: true })
  expira_em!: Date | null;
}

export class AvaliadorExternoCriadoDto {
  @ApiProperty({ type: AvaliadorExternoResponseDto })
  avaliador!: AvaliadorExternoResponseDto;

  @ApiProperty({ type: LinkAcessoDto })
  link!: LinkAcessoDto;
}
