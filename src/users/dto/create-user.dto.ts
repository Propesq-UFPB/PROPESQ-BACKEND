import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEmail, IsInt, IsNotEmpty, IsString } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ description: 'Nome completo do usuário', example: 'Dev Admin' })
  @IsNotEmpty({ message: 'O nome é obrigatório' })
  @IsString({ message: 'O nome deve ser um texto' })
  nome: string;

  @ApiProperty({ description: 'E-mail do usuário', example: 'dev@example.com' })
  @IsNotEmpty({ message: 'O e-mail é obrigatório' })
  @IsEmail({}, { message: 'O e-mail informado é inválido' })
  email: string;

  @ApiProperty({ description: 'Senha de acesso do usuário', example: 'changeme' })
  @IsNotEmpty({ message: 'A senha é obrigatória' })
  @IsString({ message: 'A senha deve ser um texto' })
  senha: string;

  @ApiProperty({ description: 'ID da função do usuário', example: 1 })
  @Type(() => Number)
  @IsNotEmpty({ message: 'O ID da função é obrigatório' })
  @IsInt({ message: 'O ID da função deve ser um número inteiro' })
  funcao_id: number;
}
