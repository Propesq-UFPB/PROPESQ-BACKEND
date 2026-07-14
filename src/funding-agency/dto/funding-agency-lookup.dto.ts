import { ApiProperty } from '@nestjs/swagger';

export class FundingAgencyLookupDto {
  @ApiProperty({ example: 1, description: 'Identificador único do órgão financiador.' })
  id!: number;

  @ApiProperty({
    example: 'CNPq',
    description: 'Nome exibido em listas e selects.',
  })
  name!: string;
}
