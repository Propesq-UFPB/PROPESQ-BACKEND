import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsString,
  Matches,
  Max,
  Min,
} from 'class-validator';

export class CreateScholarshipDto {
  @ApiProperty({ example: 'Bolsa de Iniciação Científica', description: 'Descrição da bolsa.' })
  @IsNotEmpty({ message: 'A descrição é obrigatória.' })
  @IsString({ message: 'A descrição deve ser um texto.' })
  descricao!: string;

  @ApiProperty({ example: 'PIBIC', description: 'Categoria da bolsa.' })
  @IsNotEmpty({ message: 'A categoria é obrigatória.' })
  @IsString({ message: 'A categoria deve ser um texto.' })
  categoria!: string;

  @ApiProperty({ example: 15, description: 'Dia limite para indicação (1-31).' })
  @IsInt({ message: 'O dia limite de indicação deve ser um número inteiro.' })
  @Min(1, { message: 'O dia limite de indicação deve ser no mínimo 1.' })
  @Max(31, { message: 'O dia limite de indicação deve ser no máximo 31.' })
  dia_limite_indicacao!: number;

  @ApiProperty({ example: 20, description: 'Dia limite para finalização (1-31).' })
  @IsInt({ message: 'O dia limite de finalização deve ser um número inteiro.' })
  @Min(1, { message: 'O dia limite de finalização deve ser no mínimo 1.' })
  @Max(31, { message: 'O dia limite de finalização deve ser no máximo 31.' })
  dia_limite_finalizacao!: number;

  @ApiProperty({
    example: '101',
    description: 'Máscara de 3 bits para níveis habilitados (0 ou 1).',
  })
  @IsNotEmpty({ message: 'Os níveis são obrigatórios.' })
  @IsString({ message: 'Os níveis devem ser um texto.' })
  @Matches(/^[01]{3}$/, {
    message: 'Os níveis devem ser uma string de 3 caracteres 0 ou 1 (ex.: "101").',
  })
  niveis!: string;

  @ApiProperty({ example: true, description: 'Indica se a bolsa está vinculada a cota.' })
  @IsBoolean({ message: 'O campo vinculado_cota deve ser verdadeiro ou falso.' })
  vinculado_cota!: boolean;

  @ApiProperty({ example: true, description: 'Indica se a bolsa necessita relatório.' })
  @IsBoolean({ message: 'O campo necessita_relatorio deve ser verdadeiro ou falso.' })
  necessita_relatorio!: boolean;

  @ApiProperty({
    example: false,
    description: 'Indica se a bolsa necessita dados bancários.',
  })
  @IsBoolean({ message: 'O campo necessidade_dados_bancarios deve ser verdadeiro ou falso.' })
  necessidade_dados_bancarios!: boolean;

  @ApiProperty({
    example: false,
    description: 'Indica se a bolsa possui bancos exclusivos.',
  })
  @IsBoolean({ message: 'O campo possui_bancos_exclusivos deve ser verdadeiro ou falso.' })
  possui_bancos_exclusivos!: boolean;

  @ApiProperty({
    example: false,
    description: 'Indica se a bolsa possui tipo de conta exclusivo.',
  })
  @IsBoolean({ message: 'O campo possui_tipo_conta_excls deve ser verdadeiro ou falso.' })
  possui_tipo_conta_excls!: boolean;

  @ApiProperty({
    example: '2026-01-01',
    format: 'date',
    description: 'Início do envio de relatório.',
  })
  @IsNotEmpty({ message: 'A data de início do envio de relatório é obrigatória.' })
  @IsDateString(
    {},
    { message: 'A data de início do envio de relatório deve ser válida (YYYY-MM-DD).' },
  )
  envio_relatorio_inicio!: string;

  @ApiProperty({ example: '2026-12-31', format: 'date', description: 'Fim do envio de relatório.' })
  @IsNotEmpty({ message: 'A data de fim do envio de relatório é obrigatória.' })
  @IsDateString(
    {},
    { message: 'A data de fim do envio de relatório deve ser válida (YYYY-MM-DD).' },
  )
  envio_relatorio_fim!: string;
}
