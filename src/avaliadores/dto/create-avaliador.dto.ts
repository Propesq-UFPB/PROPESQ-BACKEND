import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ArrayUnique, IsArray, IsBoolean, IsInt, IsOptional, Min } from 'class-validator';

export class CreateAvaliadorDto {
  @ApiProperty({
    example: 7,
    description: 'Id do usuário que será cadastrado como avaliador.',
  })
  @IsInt({ message: 'O usuario_id é obrigatório e deve ser um número inteiro.' })
  @Min(1, { message: 'O usuario_id deve ser maior que zero.' })
  usuario_id!: number;

  @ApiProperty({
    example: 101,
    description: 'Id da área de conhecimento principal.',
  })
  @IsInt({ message: 'A área principal é obrigatória e deve ser um número inteiro.' })
  @Min(1, { message: 'A área principal deve ser maior que zero.' })
  area_conhecimento_principal_id!: number;

  @ApiPropertyOptional({
    type: [Number],
    example: [102, 103],
    description: 'Ids das áreas de conhecimento adicionais.',
  })
  @IsOptional()
  @IsArray({ message: 'As áreas adicionais devem ser uma lista.' })
  @ArrayUnique({ message: 'Não repita áreas adicionais.' })
  @IsInt({ each: true, message: 'Cada área adicional deve ser um número inteiro.' })
  @Min(1, { each: true, message: 'Cada área adicional deve ser maior que zero.' })
  areas_adicionais_ids?: number[];

  @ApiPropertyOptional({ example: false, description: 'Servidor da Propesq. Padrão: falso.' })
  @IsOptional()
  @IsBoolean({ message: 'O campo is_propesq deve ser verdadeiro ou falso.' })
  is_propesq?: boolean;

  @ApiPropertyOptional({ example: true, description: 'Voluntário. Padrão: falso.' })
  @IsOptional()
  @IsBoolean({ message: 'O campo is_voluntario deve ser verdadeiro ou falso.' })
  is_voluntario?: boolean;

  @ApiPropertyOptional({ example: true, description: 'Avaliador ativo. Padrão: verdadeiro.' })
  @IsOptional()
  @IsBoolean({ message: 'O campo ativo deve ser verdadeiro ou falso.' })
  ativo?: boolean;
}
