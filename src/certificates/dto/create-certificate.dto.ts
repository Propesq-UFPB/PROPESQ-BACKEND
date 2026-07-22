import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateCertificateDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  usuario_id!: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  projeto_pesquisa_id?: number;

  @ApiProperty({ example: 'Participação como Bolsista', maxLength: 255 })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  tipo!: string;

  @ApiProperty({ example: 'CERT-2026-001', maxLength: 255 })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  codigo!: string;

  @ApiProperty({ example: '2026-06-01T00:00:00.000Z' })
  @IsDateString()
  emitido_em!: string;
}
