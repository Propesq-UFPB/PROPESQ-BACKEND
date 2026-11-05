import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TipoAvaliador } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { FUNCAO_AVALIADOR_EXTERNO } from '../auth/funcoes';
import { hashToken } from './token';
import { AvaliadorExternoPerfilDto, SessaoExternaDto } from './acesso-externo.dto';

export const SESSAO_EXTERNA_SEGUNDOS = 2 * 60 * 60;

@Injectable()
export class AcessoExternoService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  /** Troca o token do link por uma sessão curta, restrita às rotas de avaliador externo. */
  async abrirSessao(token: string): Promise<SessaoExternaDto> {
    const agora = new Date();
    const acesso = await this.prisma.avaliador_acesso.findUnique({
      where: { token_hash: hashToken(token) },
      select: {
        id: true,
        revogado_em: true,
        expira_em: true,
        avaliador: {
          select: {
            id: true,
            ativo: true,
            tipo: true,
            usuario: { select: { id: true, nome: true, email: true } },
            externo: { select: { instituicao: true } },
          },
        },
      },
    });

    const valido =
      acesso &&
      !acesso.revogado_em &&
      (!acesso.expira_em || acesso.expira_em > agora) &&
      acesso.avaliador.ativo &&
      acesso.avaliador.tipo === TipoAvaliador.EXTERNO;
    if (!valido) {
      // Mesma resposta para token inexistente, revogado, expirado ou avaliador inativo
      throw new UnauthorizedException('Link de acesso inválido ou expirado.');
    }

    await this.prisma.avaliador_acesso.update({
      where: { id: acesso.id },
      data: { ultimo_acesso_em: agora },
    });

    const { avaliador } = acesso;
    const accessToken = await this.jwt.signAsync(
      {
        sub: avaliador.usuario.id,
        email: avaliador.usuario.email,
        nome: avaliador.usuario.nome,
        funcao: FUNCAO_AVALIADOR_EXTERNO,
        acesso_id: acesso.id,
      },
      { expiresIn: SESSAO_EXTERNA_SEGUNDOS },
    );

    return {
      accessToken,
      expiresIn: SESSAO_EXTERNA_SEGUNDOS,
      avaliador: {
        id: avaliador.id,
        nome: avaliador.usuario.nome,
        email: avaliador.usuario.email,
        instituicao: avaliador.externo?.instituicao ?? '',
      },
    };
  }

  async perfil(usuarioId: number): Promise<AvaliadorExternoPerfilDto> {
    const avaliador = await this.prisma.avaliador.findUnique({
      where: { usuario_id: usuarioId },
      select: {
        id: true,
        usuario: { select: { nome: true, email: true } },
        externo: { select: { instituicao: true } },
      },
    });
    if (!avaliador?.externo) {
      throw new NotFoundException('Avaliador externo não encontrado.');
    }
    return {
      id: avaliador.id,
      nome: avaliador.usuario.nome,
      email: avaliador.usuario.email,
      instituicao: avaliador.externo.instituicao,
    };
  }
}
