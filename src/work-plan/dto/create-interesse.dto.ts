import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional } from 'class-validator';

export class CreateInteresseDto {
  @ApiPropertyOptional({
    description:
      'Obrigatório para GESTOR. ALUNO ignora e usa o discente vinculado ao JWT.',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  discente_id?: number;
}
