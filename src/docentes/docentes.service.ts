import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { CurrentUserPayload } from '../auth/decorators/current-user.decorator';

@Injectable()
export class DocentesService {
  constructor(private readonly prisma: PrismaService) {}

  async findEvaluationAssignments(docenteId: number, user?: CurrentUserPayload) {
    const docente = await this.prisma.docente.findUnique({
      where: { id: docenteId },
    });

    if (!docente) {
      throw new NotFoundException('Docente não encontrado');
    }

    if (
      user &&
      user.userId !== docente.usuario_id &&
      user.funcao?.toUpperCase() !== 'GESTOR' &&
      user.funcao?.toUpperCase() !== 'ADMIN' &&
      user.funcao?.toUpperCase() !== 'ADMINISTRADOR'
    ) {
      throw new ForbiddenException(
        'Você não tem permissão para visualizar as avaliações deste docente',
      );
    }

    return this.prisma.projeto_avaliacao.findMany({
      where: { avaliador_id: docente.usuario_id },
      include: {
        projeto_pesquisa: true,
        notas: {
          include: { criterio_avaliacao: true },
        },
        planos_avaliacao: {
          include: {
            plano_trabalho: true,
            notas: {
              include: { criterio_avaliacao: true },
            },
          },
        },
      },
    });
  }
}
