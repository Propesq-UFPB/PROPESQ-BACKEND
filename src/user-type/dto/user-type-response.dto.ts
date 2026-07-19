import { ApiProperty } from '@nestjs/swagger';
import { PublicoAlvo } from '@prisma/client';

export class UserTypeResponseDto {
  @ApiProperty({ example: 1, description: 'Identificador único do tipo de usuário.' })
  id!: number;

  @ApiProperty({ example: 'Coordenador de Projeto', description: 'Nome do tipo de usuário.' })
  nome!: string;

  @ApiProperty({
    example: 'Pode criar/gerenciar projetos e submeter propostas em editais.',
    description: 'Descrição do tipo de usuário.',
    nullable: true,
  })
  descricao!: string | null;

  @ApiProperty({
    enum: PublicoAlvo,
    isArray: true,
    example: [PublicoAlvo.DOCENTE, PublicoAlvo.TECNICO_ADMINISTRATIVO],
    description: 'Públicos que podem se enquadrar neste tipo.',
  })
  publicos!: PublicoAlvo[];

  @ApiProperty({ example: true, description: 'Indica se o tipo de usuário está ativo.' })
  ativo!: boolean;
}
