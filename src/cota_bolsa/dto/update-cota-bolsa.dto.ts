import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsOptional, IsString, ValidateNested } from 'class-validator';

class UpdatePeriodoCotaBolsaDto {
  @ApiPropertyOptional({ type: 'string', format: 'date' })
  @IsOptional()
  @IsString()
  inicio?: Date;

  @ApiPropertyOptional({ type: 'string', format: 'date' })
  @IsOptional()
  @IsString()
  fim?: Date;
}

export class UpdateCotaBolsaDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  codigo?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  relatorio_anual?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  orgao_financiador?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  descricao?: string;

  @ApiPropertyOptional({ type: UpdatePeriodoCotaBolsaDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdatePeriodoCotaBolsaDto)
  periodo_validade?: UpdatePeriodoCotaBolsaDto;

  @ApiPropertyOptional({ type: UpdatePeriodoCotaBolsaDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdatePeriodoCotaBolsaDto)
  envio_relatorios_parciais?: UpdatePeriodoCotaBolsaDto;

  @ApiPropertyOptional({ type: UpdatePeriodoCotaBolsaDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdatePeriodoCotaBolsaDto)
  envio_relatorios_finais?: UpdatePeriodoCotaBolsaDto;

  @ApiPropertyOptional({ type: UpdatePeriodoCotaBolsaDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdatePeriodoCotaBolsaDto)
  cadastro_plano_voluntario?: UpdatePeriodoCotaBolsaDto;
}
