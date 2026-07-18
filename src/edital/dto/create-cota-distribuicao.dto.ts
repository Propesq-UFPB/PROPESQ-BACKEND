import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsNotEmpty, IsNumber, IsOptional, Min } from 'class-validator';

export class CreateEditalCotaDistribuicaoDto {
  @ApiProperty({ required: true, type: Number })
  @IsNotEmpty()
  @IsInt()
  quantidade: number;

  @ApiProperty({ required: true, type: Number })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  fppi_min: number;

  @ApiProperty({ required: false, type: Number, description: 'Esse valor é opcional' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  fppi_max: number;

  @ApiProperty({ required: true, type: Number })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  media_min_proj: number;

  @ApiProperty({ required: true, type: Boolean })
  @IsNotEmpty()
  @IsBoolean()
  exige_doutorado: boolean;

  @ApiProperty({
    required: true,
    type: Number,
    description:
      'Campo opcional, não enviá-lo significa que não se deseja atribuir procentagem a novos doutorandos',
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  percentual_cotas_novos_doutorandos: number;

  @ApiProperty({ required: false, type: Number })
  @IsOptional()
  @IsNumber()
  @Min(0)
  fppi_min_novos_doutorandos: number;

  @ApiProperty({ required: false, type: Number })
  @IsOptional()
  @IsNumber()
  @Min(0)
  fppi_max_novos_doutorandos: number;
}
