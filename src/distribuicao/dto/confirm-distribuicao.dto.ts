import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsInt, ValidateNested } from 'class-validator';

export class AtribuicaoDto {
  @ApiProperty()
  @IsInt({ message: 'O projeto_id deve ser um número inteiro.' })
  projeto_id: number;

  @ApiProperty()
  @IsInt({ message: 'O consultor_id deve ser um número inteiro.' })
  consultor_id: number;
}

export class ConfirmDistribuicaoDto {
  @ApiProperty({
    type: [AtribuicaoDto],
    description:
      'Conjunto final de atribuições do edital. Atribuições com notas lançadas são sempre preservadas, mesmo que não sejam enviadas.',
  })
  @IsArray({ message: 'atribuicoes deve ser uma lista.' })
  @ValidateNested({ each: true })
  @Type(() => AtribuicaoDto)
  atribuicoes: AtribuicaoDto[];
}
