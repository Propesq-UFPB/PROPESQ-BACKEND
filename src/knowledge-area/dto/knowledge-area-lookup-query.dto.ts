import { Transform } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

function trimOptionalString({ value }: { value: unknown }): unknown {
  if (typeof value !== 'string') return value;
  return value.trim() || undefined;
}

export class KnowledgeAreaLookupQueryDto {
  @ApiPropertyOptional({
    description: 'Grande área usada para listar as áreas imediatamente abaixo dela.',
    example: 'Ciências Agrárias',
  })
  @IsOptional()
  @IsString()
  @Transform(trimOptionalString)
  grande_area?: string;

  @ApiPropertyOptional({
    description: 'Área usada para listar as subáreas imediatamente abaixo dela.',
    example: 'Agronomia',
  })
  @IsOptional()
  @IsString()
  @Transform(trimOptionalString)
  area?: string;

  @ApiPropertyOptional({
    description: 'Subárea usada para listar as especialidades imediatamente abaixo dela.',
    example: 'Ciência do Solo',
  })
  @IsOptional()
  @IsString()
  @Transform(trimOptionalString)
  sub_area?: string;
}
