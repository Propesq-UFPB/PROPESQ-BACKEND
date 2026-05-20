import { Type } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

export interface PaginatedResult<T> {
  total: number;
  limit: number;
  offset: number;
  results: T[];
}

/**
 * Factory para documentação Swagger de respostas paginadas.
 * Uso: @ApiResponse({ type: Paginated(ScholarshipResponseDto) })
 */
export function Paginated<TModel extends Type<unknown>>(itemDto: TModel) {
  class PaginatedDtoClass implements PaginatedResult<InstanceType<TModel>> {
    @ApiProperty({ example: 1, description: 'Total de registros encontrados.' })
    total!: number;

    @ApiProperty({ example: 10, description: 'Quantidade máxima de itens por página.' })
    limit!: number;

    @ApiProperty({ example: 0, description: 'Deslocamento da paginação.' })
    offset!: number;

    @ApiProperty({ type: itemDto, isArray: true, description: 'Itens da página atual.' })
    results!: InstanceType<TModel>[];
  }

  Object.defineProperty(PaginatedDtoClass, 'name', {
    value: `Paginated${itemDto.name}`,
  });

  return PaginatedDtoClass;
}

/** @deprecated Use PaginatedResult<T> nos services e Paginated(ItemDto) no Swagger. */
export type PaginatedDto<T> = PaginatedResult<T>;
