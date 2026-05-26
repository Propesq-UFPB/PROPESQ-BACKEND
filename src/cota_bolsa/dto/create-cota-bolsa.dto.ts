import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';

class PeriodoCotaBolsaDto {
  @ApiProperty({ type: 'string', format: 'date' })
  @IsNotEmpty()
  @IsString()
  inicio: Date;

  @ApiProperty({ type: 'string', format: 'date' })
  @IsNotEmpty()
  @IsString()
  fim: Date;
}

export class CreateCotaBolsaDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  codigo?: string;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsBoolean()
  relatorio_anual: boolean;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsString()
  orgao_financiador: string;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsString()
  descricao: string;

  @ApiProperty({ required: true, type: PeriodoCotaBolsaDto })
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => PeriodoCotaBolsaDto)
  periodo_validade: PeriodoCotaBolsaDto;

  @ApiProperty({ required: true, type: PeriodoCotaBolsaDto })
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => PeriodoCotaBolsaDto)
  envio_relatorios_parciais: PeriodoCotaBolsaDto;

  @ApiProperty({ required: true, type: PeriodoCotaBolsaDto })
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => PeriodoCotaBolsaDto)
  envio_relatorios_finais: PeriodoCotaBolsaDto;

  @ApiProperty({ required: true, type: PeriodoCotaBolsaDto })
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => PeriodoCotaBolsaDto)
  cadastro_plano_voluntario: PeriodoCotaBolsaDto;
}
