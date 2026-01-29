import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateAcademicUnit {
  @ApiProperty({ type: 'string', maxLength: 15, required: true })
  @IsNotEmpty()
  @IsString()
  @MaxLength(15)
  sigla: string;

  @ApiProperty({ type: 'string', maxLength: 255, required: true })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  nome: string;
}
