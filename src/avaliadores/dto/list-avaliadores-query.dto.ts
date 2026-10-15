import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, TransformFnParams, Type } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, Max, Min } from 'class-validator';

const toBoolean = ({ obj, key }: TransformFnParams) => {
  const value = (obj as Record<string, unknown>)[key];
  if (value === 'true') return true;
  if (value === 'false') return false;
  return value;
};

export class ListAvaliadoresQueryDto {
  @ApiPropertyOptional({ description: 'Filtra por avaliadores ativos ou inativos.' })
  @IsOptional()
  @Transform(toBoolean)
  @IsBoolean({ message: 'O filtro ativo deve ser true ou false.' })
  ativo?: boolean;

  @ApiPropertyOptional({ description: 'Filtra por servidores da Propesq.' })
  @IsOptional()
  @Transform(toBoolean)
  @IsBoolean({ message: 'O filtro is_propesq deve ser true ou false.' })
  is_propesq?: boolean;

  @ApiPropertyOptional({ description: 'Filtra por voluntários.' })
  @IsOptional()
  @Transform(toBoolean)
  @IsBoolean({ message: 'O filtro is_voluntario deve ser true ou false.' })
  is_voluntario?: boolean;

  @ApiPropertyOptional({ example: 101, description: 'Id da área de conhecimento principal.' })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'area_principal_id deve ser um número inteiro.' })
  @Min(1, { message: 'area_principal_id deve ser maior que zero.' })
  area_principal_id?: number;

  @ApiPropertyOptional({
    example: 102,
    description:
      'Id de uma área adicional (o avaliador precisa ter essa área entre as adicionais).',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'area_adicional_id deve ser um número inteiro.' })
  @Min(1, { message: 'area_adicional_id deve ser maior que zero.' })
  area_adicional_id?: number;

  @ApiPropertyOptional({ example: 20, description: 'Itens por página (1 a 100). Padrão: 20.' })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'limit deve ser um número inteiro.' })
  @Min(1, { message: 'limit deve ser no mínimo 1.' })
  @Max(100, { message: 'limit deve ser no máximo 100.' })
  limit?: number;

  @ApiPropertyOptional({ example: 0, description: 'Quantos itens pular. Padrão: 0.' })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'offset deve ser um número inteiro.' })
  @Min(0, { message: 'offset não pode ser negativo.' })
  offset?: number;
}
