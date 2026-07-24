import { StatusEdital } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class EditalStatusLookupDto {
  @ApiProperty({
    enum: StatusEdital,
    example: StatusEdital.PUBLICADO,
    description: 'Valor do enum usado no status do edital.',
  })
  id!: StatusEdital;

  @ApiProperty({
    example: 'Publicado',
    description: 'Nome exibido em listas e selects.',
  })
  name!: string;
}
