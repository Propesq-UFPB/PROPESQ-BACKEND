import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, TransformFnParams, Type } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

// Query strings chegam como texto: só 'true'/'false' viram booleano, o resto é rejeitado
const toBoolean = ({ obj, key }: TransformFnParams): unknown => {
  const value = (obj as Record<string, unknown>)[key];
  if (value === 'true') return true;
  if (value === 'false') return false;
  return value;
};

export class ListAvaliadoresQueryDto {
  @ApiPropertyOptional({ example: 10, description: 'Itens por página (1 a 100). Padrão: 10.' })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'limit deve ser um número inteiro.' })
  @Min(1, { message: 'limit deve ser no mínimo 1.' })
  @Max(100, { message: 'limit deve ser no máximo 100.' })
  limit: number = 10;

  @ApiPropertyOptional({ example: 0, description: 'Quantos itens pular. Padrão: 0.' })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'offset deve ser um número inteiro.' })
  @Min(0, { message: 'offset não pode ser negativo.' })
  offset: number = 0;

  @ApiPropertyOptional({ description: 'Busca por nome ou e-mail do usuário.' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Filtra por avaliadores ativos ou inativos.' })
  @IsOptional()
  @Transform(toBoolean)
  @IsBoolean({ message: 'O filtro ativo deve ser true ou false.' })
  ativo?: boolean;

  @ApiPropertyOptional({ description: 'Filtra por avaliadores da PROPESQ.' })
  @IsOptional()
  @Transform(toBoolean)
  @IsBoolean({ message: 'O filtro is_propesq deve ser true ou false.' })
  is_propesq?: boolean;

  @ApiPropertyOptional({ description: 'Filtra por avaliadores voluntários.' })
  @IsOptional()
  @Transform(toBoolean)
  @IsBoolean({ message: 'O filtro is_voluntario deve ser true ou false.' })
  is_voluntario?: boolean;

  @ApiPropertyOptional({ description: 'Filtra por bolsistas de produtividade CNPq.' })
  @IsOptional()
  @Transform(toBoolean)
  @IsBoolean({ message: 'O filtro is_cnpq deve ser true ou false.' })
  is_cnpq?: boolean;

  @ApiPropertyOptional({ example: 345, description: 'Id da área de conhecimento principal.' })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'area_principal_id deve ser um número inteiro.' })
  @Min(1, { message: 'area_principal_id deve ser maior que zero.' })
  area_principal_id?: number;

  @ApiPropertyOptional({
    example: 346,
    description: 'Id de uma área adicional (o avaliador precisa tê-la entre as adicionais).',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'area_adicional_id deve ser um número inteiro.' })
  @Min(1, { message: 'area_adicional_id deve ser maior que zero.' })
  area_adicional_id?: number;
}
