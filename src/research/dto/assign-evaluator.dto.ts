import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty } from 'class-validator';

export class AssignEvaluatorDto {
  @ApiProperty({ description: 'ID do usuário coordenador', example: 1 })
  @IsNotEmpty({ message: 'O ID do coordenador é obrigatório.' })
  @IsInt({ message: 'O ID do coordenador deve ser um número inteiro.' })
  coordinator_id!: number;
}
