import { ApiProperty } from '@nestjs/swagger';
import { StatusInteressePlano } from '@prisma/client';

export class InteresseResponseDto {
  @ApiProperty()
  id!: number;

  @ApiProperty()
  plano_trabalho_id!: number;

  @ApiProperty()
  discente_id!: number;

  @ApiProperty({ enum: StatusInteressePlano })
  status!: StatusInteressePlano;

  @ApiProperty()
  criado_em!: string;
}
