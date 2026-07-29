import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TipoIndicacao } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateIf,
  ValidateNested,
} from 'class-validator';

export class DadosBancariosIndicacaoDto {
  @ApiProperty({ example: 'Banco do Brasil' })
  @IsString()
  @IsNotEmpty()
  banco!: string;

  @ApiProperty({ example: '1234-5' })
  @IsString()
  @IsNotEmpty()
  agencia!: string;

  @ApiProperty({ example: '98765-4' })
  @IsString()
  @IsNotEmpty()
  conta!: string;
}

export class ConfirmIndicacaoDto {
  @ApiProperty({ description: 'ID do interesse (candidato) no plano.' })
  @Type(() => Number)
  @IsInt()
  interesse_id!: number;

  @ApiProperty({ enum: TipoIndicacao })
  @IsEnum(TipoIndicacao)
  tipo_indicacao!: TipoIndicacao;

  @ApiPropertyOptional({
    type: DadosBancariosIndicacaoDto,
    description: 'Obrigatório quando tipo_indicacao = BOLSISTA.',
    nullable: true,
  })
  @ValidateIf(o => o.tipo_indicacao === TipoIndicacao.BOLSISTA)
  @ValidateNested()
  @Type(() => DadosBancariosIndicacaoDto)
  @IsOptional()
  dados_bancarios?: DadosBancariosIndicacaoDto | null;
}
