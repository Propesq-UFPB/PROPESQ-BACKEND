import { Body, Controller, HttpStatus, Param, ParseIntPipe, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { SubmitEvaluationDto } from './dto/submit-evaluation.dto';
import { SubmitPlanoEvaluationDto } from './dto/submit-plano-evaluation.dto';
import { ResearchEvaluationService } from './research-evaluation.service';

@ApiBearerAuth('bearer')
@ApiTags('Avaliações de Projetos de Pesquisa')
@Controller('research-evaluation')
export class ResearchEvaluationController {
  constructor(private readonly researchEvaluationService: ResearchEvaluationService) {}

  @Post(':id')
  @ApiOperation({
    summary: 'Submete as notas de uma avaliação de projeto de pesquisa',
    description:
      'Registra a descrição e as notas da avaliação. Somente o avaliador atribuído à avaliação pode submeter os dados. Exige que todos os planos de trabalho do projeto já tenham sido avaliados.',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Avaliação submetida com sucesso.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description:
      'Dados inválidos, critérios repetidos, nota maior que a nota máxima permitida para o critério, ou planos de trabalho pendentes de avaliação.',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'O usuário autenticado não é o avaliador atribuído a esta avaliação.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Avaliação, projeto vinculado ou critério de avaliação não encontrado.',
  })
  async submitEvaluation(
    @Param('id', ParseIntPipe) id: number,
    @Body() submitEvaluationDto: SubmitEvaluationDto,
    @CurrentUser('userId') userId: number,
  ) {
    return this.researchEvaluationService.submitEvaluation(id, submitEvaluationDto, userId);
  }

  @Post('planos/:id')
  @ApiOperation({
    summary: 'Submete a nota de um plano de trabalho',
    description:
      'Registra a nota de um plano de trabalho para um critério de avaliação. Somente o avaliador atribuído à avaliação do projeto pode submeter os dados.',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Nota do plano de trabalho registrada com sucesso.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Critério de avaliação inválido/inativo ou plano já avaliado.',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'O usuário autenticado não é o avaliador atribuído a esta avaliação.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Plano de avaliação não encontrado.',
  })
  async submitPlanoEvaluation(
    @Param('id', ParseIntPipe) id: number,
    @Body() submitPlanoEvaluationDto: SubmitPlanoEvaluationDto,
    @CurrentUser('userId') userId: number,
  ) {
    return this.researchEvaluationService.submitPlanoEvaluation(
      id,
      submitPlanoEvaluationDto,
      userId,
    );
  }
}
