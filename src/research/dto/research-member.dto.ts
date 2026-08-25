import {
  MembroExternoFormacao,
  TipoMembroExterno,
  TipoMembroProjeto,
  TipoSexo,
} from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateResearchProjectMemberDto {
  @ApiProperty({ type: Number, description: 'ID do usuário cadastrado no sistema' })
  @Type(() => Number)
  @IsInt({ message: 'O ID do usuário deve ser um número inteiro' })
  @Min(1, { message: 'O ID do usuário deve ser maior que zero' })
  user_id!: number;

  @ApiProperty({ enum: TipoMembroProjeto })
  @IsEnum(TipoMembroProjeto, { message: 'A função do membro é inválida' })
  funcao!: TipoMembroProjeto;

  @ApiProperty({ type: Number, description: 'Carga horária dedicada ao projeto' })
  @Type(() => Number)
  @IsInt({ message: 'A carga horária dedicada deve ser um número inteiro' })
  @Min(1, { message: 'A carga horária dedicada deve ser maior que zero' })
  ch_dedicadas!: number;
}

export class CreateResearchProjectExternalMemberDto {
  @ApiProperty({ enum: TipoMembroProjeto })
  @IsEnum(TipoMembroProjeto, { message: 'A função do membro externo é inválida' })
  funcao!: TipoMembroProjeto;

  @ApiProperty({ type: Number, description: 'Carga horária dedicada ao projeto' })
  @Type(() => Number)
  @IsInt({ message: 'A carga horária dedicada deve ser um número inteiro' })
  @Min(1, { message: 'A carga horária dedicada deve ser maior que zero' })
  ch_dedicada!: number;

  @ApiPropertyOptional({ maxLength: 25, description: 'CPF; omitir para pessoa estrangeira' })
  @IsOptional()
  @IsString({ message: 'O CPF deve ser um texto' })
  @MaxLength(25, { message: 'O CPF deve possuir no máximo 25 caracteres' })
  cpf?: string;

  @ApiProperty({ maxLength: 255 })
  @IsString({ message: 'O nome do membro externo deve ser um texto' })
  @IsNotEmpty({ message: 'O nome do membro externo é obrigatório' })
  @MaxLength(255, { message: 'O nome deve possuir no máximo 255 caracteres' })
  nome!: string;

  @ApiProperty({ maxLength: 255 })
  @IsEmail({}, { message: 'O e-mail do membro externo deve ser válido' })
  @MaxLength(255, { message: 'O e-mail deve possuir no máximo 255 caracteres' })
  email!: string;

  @ApiProperty({ enum: TipoSexo })
  @IsEnum(TipoSexo, { message: 'O sexo do membro externo é inválido' })
  sexo!: TipoSexo;

  @ApiProperty({ enum: MembroExternoFormacao })
  @IsEnum(MembroExternoFormacao, { message: 'A formação do membro externo é inválida' })
  formacao!: MembroExternoFormacao;

  @ApiProperty({ enum: TipoMembroExterno })
  @IsEnum(TipoMembroExterno, { message: 'O tipo do membro externo é inválido' })
  tipo!: TipoMembroExterno;
}
