import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { DocentesService } from './docentes.service';

@ApiBearerAuth('bearer')
@ApiTags('Docentes')
@Controller('docentes')
export class DocentesController {
  constructor(private readonly docentesService: DocentesService) {}

  @Get(':id/avaliacoes')
  @ApiOperation({
    summary: 'Lista as atribuições de avaliação de projetos e planos de trabalho de um docente',
  })
  @ApiParam({ name: 'id', type: Number, description: 'ID do docente.' })
  @ApiOkResponse({ description: 'Atribuições de avaliação retornadas com sucesso.' })
  @ApiNotFoundResponse({ description: 'Docente não encontrado' })
  async findEvaluationAssignments(@Param('id', ParseIntPipe) id: number) {
    return this.docentesService.findEvaluationAssignments(id);
  }
}
