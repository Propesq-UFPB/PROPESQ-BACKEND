import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SubmitEvaluationDto } from './dto/submit-evaluation.dto';

@Injectable()
export class ResearchEvaluationService {
  constructor(private readonly prisma: PrismaService) {}

  async submitEvaluation(id: number, submitEvaluationDto: SubmitEvaluationDto, userId: number) {
    return this.prisma.$transaction(async prisma => {
      const research_evaluation = await prisma.projeto_avaliacao.findUnique({
        where: { id },
        include: { notas: true },
      });

      // Validações da distribuição e do avaliador
      if (!research_evaluation) {
        throw new NotFoundException('Atribuição de avaliação não encontrada');
      }

      if (research_evaluation.avaliador_id !== userId) {
        throw new ForbiddenException('O usuário não possui permissão para realizar essa avaliação');
      }

      if (research_evaluation.notas.length > 0) {
        throw new BadRequestException('Esta avaliação já foi enviada');
      }

      // Validações dos critérios
      const active_evaluation_criterias = await prisma.criterio_avaliacao.findMany({
        where: { ativo: true },
      });

      const submitted_evaluation_criterias_id = submitEvaluationDto.notas.map(
        nota => nota.criterio_avaliacao_id,
      );
      const evaluation_criterias_id = new Set<number>(submitted_evaluation_criterias_id);

      if (evaluation_criterias_id.size !== submitted_evaluation_criterias_id.length) {
        throw new BadRequestException('Critérios de avaliação repetidos');
      }

      const active_evaluation_criterias_id = new Set<number>(
        active_evaluation_criterias.map(criterio => criterio.id),
      );

      const has_only_active_criterias = submitted_evaluation_criterias_id.every(criterio_id =>
        active_evaluation_criterias_id.has(criterio_id),
      );
      const has_all_active_criterias =
        evaluation_criterias_id.size === active_evaluation_criterias_id.size;

      if (!has_only_active_criterias || !has_all_active_criterias) {
        throw new BadRequestException(
          'A avaliação deve conter exatamente todos os critérios ativos',
        );
      }

      return prisma.projeto_avaliacao.update({
        where: { id },
        data: {
          descricao: submitEvaluationDto.descricao,
          notas: {
            create: submitEvaluationDto.notas.map(nota => ({
              criterio_avaliacao_id: nota.criterio_avaliacao_id,
              nota: nota.nota,
            })),
          },
        },
        include: {
          avaliador: true,
          projeto_pesquisa: true,
          notas: {
            include: {
              criterio_avaliacao: true,
            },
          },
        },
      });
    });
  }
}
