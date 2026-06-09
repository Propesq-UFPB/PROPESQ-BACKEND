import { Body, Controller, HttpStatus, Param, ParseIntPipe, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { SubmitEvaluationDto } from './dto/submit-evaluation.dto';
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
      'Registra a descrição e as notas da avaliação. Somente o avaliador atribuído à avaliação pode submeter os dados.',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Avaliação submetida com sucesso.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description:
      'Dados inválidos, critérios repetidos ou nota maior que a nota máxima permitida para o critério.',
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
}
