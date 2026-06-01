import { ApiProperty } from '@nestjs/swagger';

export class CategoryResponseDto {
  @ApiProperty({ example: 1, description: 'Identificador único da categoria.' })
  id!: number;

  @ApiProperty({ example: 'Iniciação Científica', description: 'Denominação da categoria.' })
  denominacao!: string;

  @ApiProperty({ example: 1, description: 'Ordem de exibição da categoria.' })
  ordem!: number;

  @ApiProperty({ example: true, description: 'Indica se a categoria está ativa.' })
  ativo!: boolean;
}
