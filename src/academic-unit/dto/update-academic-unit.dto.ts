import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateAcademicUnit {
  @ApiProperty({ type: 'string', maxLength: 15, required: false })
  @IsOptional()
  @IsString()
  @MaxLength(15)
  sigla: string;

  @ApiProperty({ type: 'string', maxLength: 255, required: false })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  nome: string;

  @ApiProperty({ type: 'boolean', required: false })
  @IsOptional()
  @IsBoolean()
  ativo: boolean;
}
