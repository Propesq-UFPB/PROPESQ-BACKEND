import { TipoEdital } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class EditalTypeLookupDto {
  @ApiProperty({
    enum: TipoEdital,
    example: TipoEdital.PESQUISA,
    description: 'Valor do enum usado no cadastro do edital.',
  })
  id!: TipoEdital;

  @ApiProperty({
    example: 'Pesquisa',
    description: 'Nome exibido em listas e selects.',
  })
  name!: string;
}
