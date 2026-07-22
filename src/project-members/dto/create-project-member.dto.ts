import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsOptional, Min } from 'class-validator';

export class CreateProjectMemberDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  projeto_pesquisa_id!: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  usuario_id!: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  funcao_projeto_id!: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  ativo?: boolean;
}
