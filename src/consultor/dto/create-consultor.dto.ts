import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ArrayUnique, IsArray, IsBoolean, IsInt, IsOptional } from 'class-validator';

export class CreateConsultorDto {
  @ApiProperty({ example: 12, description: 'Usuário que será cadastrado como consultor.' })
  @IsInt({ message: 'O usuario_id deve ser um número inteiro.' })
  usuario_id!: number;

  @ApiPropertyOptional({
    example: 345,
    description:
      'Área de conhecimento principal. Se omitida, usa a área cadastrada no docente do usuário.',
  })
  @IsOptional()
  @IsInt({ message: 'A área principal deve ser um número inteiro.' })
  area_principal_id?: number;

  @ApiPropertyOptional({
    type: [Number],
    example: [346, 400],
    description: 'Áreas de conhecimento adicionais.',
  })
  @IsOptional()
  @IsArray({ message: 'As áreas adicionais devem ser uma lista.' })
  @ArrayUnique({ message: 'As áreas adicionais não podem se repetir.' })
  @IsInt({ each: true, message: 'Cada área adicional deve ser um número inteiro.' })
  areas_adicionais_ids?: number[];

  @ApiPropertyOptional({ example: false, description: 'Consultor da PROPESQ.' })
  @IsOptional()
  @IsBoolean({ message: 'O campo is_propesq deve ser verdadeiro ou falso.' })
  is_propesq?: boolean;

  @ApiPropertyOptional({ example: false, description: 'Consultor voluntário.' })
  @IsOptional()
  @IsBoolean({ message: 'O campo is_voluntario deve ser verdadeiro ou falso.' })
  is_voluntario?: boolean;

  @ApiPropertyOptional({ example: false, description: 'Consultor bolsista de produtividade CNPq.' })
  @IsOptional()
  @IsBoolean({ message: 'O campo is_cnpq deve ser verdadeiro ou falso.' })
  is_cnpq?: boolean;

  @ApiPropertyOptional({ example: true, description: 'Indica se o consultor está ativo.' })
  @IsOptional()
  @IsBoolean({ message: 'O campo ativo deve ser verdadeiro ou falso.' })
  ativo?: boolean;
}
