import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DocentesService {
  constructor(private readonly prisma: PrismaService) {}

  async findEvaluationAssignments(docenteId: number) {
    const docente = await this.prisma.docente.findUnique({
      where: { id: docenteId },
    });

    if (!docente) {
      throw new NotFoundException('Docente não encontrado');
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
