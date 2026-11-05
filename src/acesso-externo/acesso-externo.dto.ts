import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class AbrirSessaoDto {
  @ApiProperty({ description: 'Token que vem no final do link de acesso.' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  token!: string;
}

export class AvaliadorExternoPerfilDto {
  @ApiProperty({ example: 7, description: 'Id do cadastro de avaliador.' })
  id!: number;

  @ApiProperty({ example: 'Ana Souza' })
  nome!: string;

  @ApiProperty({ example: 'ana.souza@ufpe.br' })
  email!: string;

  @ApiProperty({ example: 'Universidade Federal de Pernambuco' })
  instituicao!: string;
}

export class SessaoExternaDto {
  @ApiProperty({ description: 'Bearer token das rotas liberadas ao avaliador externo.' })
  accessToken!: string;

  @ApiProperty({ example: 7200, description: 'Validade da sessão, em segundos.' })
  expiresIn!: number;

  @ApiProperty({ type: AvaliadorExternoPerfilDto })
  avaliador!: AvaliadorExternoPerfilDto;
}
