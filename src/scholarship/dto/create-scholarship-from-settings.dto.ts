import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateScholarshipFromSettingsDto {
  @ApiProperty({ example: 'PIBIC', description: 'Nome/descrição do tipo de bolsa.' })
  @IsNotEmpty({ message: 'A descrição é obrigatória.' })
  @IsString({ message: 'A descrição deve ser um texto.' })
  descricao!: string;

  @ApiProperty({ example: 1, description: 'ID do órgão financiador.' })
  @IsInt({ message: 'O órgão financiador deve ser um número inteiro.' })
  orgao_id!: number;

  @ApiPropertyOptional({
    example: 700,
    nullable: true,
    description: 'Valor mensal da bolsa (opcional).',
  })
  @IsOptional()
  @IsNumber({}, { message: 'O valor deve ser um número.' })
  @Min(0, { message: 'O valor deve ser no mínimo 0.' })
  valor?: number | null;

  @ApiPropertyOptional({
    example: false,
    description: 'Indica se a bolsa permite acúmulo.',
  })
  @IsOptional()
  @IsBoolean({ message: 'O campo permite_acumulo deve ser verdadeiro ou falso.' })
  permite_acumulo?: boolean;
}
