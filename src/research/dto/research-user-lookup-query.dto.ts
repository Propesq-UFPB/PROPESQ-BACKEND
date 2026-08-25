import { Transform } from 'class-transformer';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CategoriaMembroProjeto } from './research-lookups.dto';

export class ResearchUserLookupQueryDto {
  @ApiPropertyOptional({ enum: CategoriaMembroProjeto })
  @IsOptional()
  @IsEnum(CategoriaMembroProjeto, { message: 'A categoria de membro é inválida' })
  categoria?: CategoriaMembroProjeto;

  @ApiPropertyOptional({
    enum: CategoriaMembroProjeto,
    description: 'Alias de categoria para filtrar usuários por função/vínculo.',
  })
  @IsOptional()
  @IsEnum(CategoriaMembroProjeto, { message: 'A função de membro é inválida' })
  funcao?: CategoriaMembroProjeto;

  @ApiPropertyOptional({ description: 'Busca parcial por nome ou e-mail' })
  @IsOptional()
  @IsString()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() || undefined : value,
  )
  search?: string;
}
