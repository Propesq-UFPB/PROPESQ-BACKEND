import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { CurrentUserPayload } from '../auth/decorators/current-user.decorator';
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
  @ApiForbiddenResponse({ description: 'Acesso não autorizado às avaliações deste docente' })
  async findEvaluationAssignments(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.docentesService.findEvaluationAssignments(id, user);
  }
}
