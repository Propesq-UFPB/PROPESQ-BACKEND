import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SubmitEvaluationDto } from './dto/submit-evaluation.dto';
import { SubmitPlanoEvaluationDto } from './dto/submit-plano-evaluation.dto';

@Injectable()
export class ResearchEvaluationService {
  constructor(private readonly prisma: PrismaService) {}

  async submitPlanoEvaluation(
    planoAvaliacaoId: number,
    submitPlanoEvaluationDto: SubmitPlanoEvaluationDto,
    userId: number,
  ) {
    return this.prisma.$transaction(async prisma => {
      const plano_avaliacao = await prisma.plano_avaliacao.findUnique({
        where: { id: planoAvaliacaoId },
        include: { projeto_avaliacao: true, notas: true },
      });

      if (!plano_avaliacao) {
        throw new NotFoundException('Plano de avaliação não encontrado');
      }

      if (plano_avaliacao.projeto_avaliacao.avaliador_id !== userId) {
        throw new ForbiddenException('O usuário não possui permissão para realizar essa avaliação');
      }

      if (plano_avaliacao.notas.length > 0) {
        throw new BadRequestException('Este plano já foi avaliado');
      }

      // Validações dos critérios (mesmo padrão do submitEvaluation)
      const active_evaluation_criterias = await prisma.criterio_avaliacao.findMany({
        where: { ativo: true },
      });
      const criteriasMap = new Map(active_evaluation_criterias.map(c => [c.id, c]));

      const submitted_evaluation_criterias_id = submitPlanoEvaluationDto.notas.map(
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
          'A avaliação do plano deve conter exatamente todos os critérios ativos',
        );
      }

      // Validar limites de notas por critério
      for (const nota of submitPlanoEvaluationDto.notas) {
        const criterio = criteriasMap.get(nota.criterio_avaliacao_id);
        if (criterio && nota.nota > criterio.nota_maxima) {
          throw new BadRequestException(
            `A nota para o critério "${criterio.nome}" (${nota.nota}) excede a nota máxima permitida (${criterio.nota_maxima})`,
          );
        }
      }

      return prisma.plano_avaliacao.update({
        where: { id: planoAvaliacaoId },
        data: {
          descricao: submitPlanoEvaluationDto.descricao,
          notas: {
            create: submitPlanoEvaluationDto.notas.map(nota => ({
              criterio_avaliacao_id: nota.criterio_avaliacao_id,
              nota: nota.nota,
            })),
          },
        },
        include: {
          notas: { include: { criterio_avaliacao: true } },
        },
      });
    });
  }

  async submitEvaluation(id: number, submitEvaluationDto: SubmitEvaluationDto, userId: number) {
    return this.prisma.$transaction(async prisma => {
      const research_evaluation = await prisma.projeto_avaliacao.findUnique({
        where: { id },
        include: { notas: true, planos_avaliacao: { include: { notas: true } } },
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

      // Nota do projeto só pode ser registrada com todos os planos já avaliados
      const has_plano_pendente = research_evaluation.planos_avaliacao.some(
        plano => plano.notas.length === 0,
      );
      if (has_plano_pendente) {
        throw new BadRequestException(
          'Todos os planos de trabalho do projeto devem ser avaliados antes da nota do projeto',
        );
      }

      // Validações dos critérios
      const active_evaluation_criterias = await prisma.criterio_avaliacao.findMany({
        where: { ativo: true },
      });
      const criteriasMap = new Map(active_evaluation_criterias.map(c => [c.id, c]));

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

      // Validar limites de notas por critério
      for (const nota of submitEvaluationDto.notas) {
        const criterio = criteriasMap.get(nota.criterio_avaliacao_id);
        if (criterio && nota.nota > criterio.nota_maxima) {
          throw new BadRequestException(
            `A nota para o critério "${criterio.nome}" (${nota.nota}) excede a nota máxima permitida (${criterio.nota_maxima})`,
          );
        }
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
            include: { criterio_avaliacao: true },
          },
        },
      });
    });
  }
}
