import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { WorkPlanService } from './work-plan.service';
import { WorkPlan } from './entities/work-plan.entity';
import { WorkPlanCreationDto } from './dto/create-work-plan.dto';
import { WorkPlanUpdateDto } from './dto/update-work-plan.dto';

@ApiTags('plano-trabalho')
@ApiBearerAuth('bearer')
@Controller('plano-trabalho')
export class WorkPlanController {
  constructor(private readonly planoTrabalhoService: WorkPlanService) {}

  @Post()
  @ApiOperation({ summary: 'Cria um novo plano de trabalho' })
  @ApiResponse({
    status: 201,
    description: 'Plano de trabalho criado com sucesso.',
    type: WorkPlan,
  })
  @ApiResponse({ status: 400, description: 'Requisição inválida.' })
  @ApiResponse({
    status: 404,
    description: 'Recurso referenciado não encontrado.',
  })
  create(@Body() createPlanoTrabalhoDto: WorkPlanCreationDto) {
    return this.planoTrabalhoService.create(createPlanoTrabalhoDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtém todos os planos de trabalho com paginação' })
  @ApiQuery({ name: 'limit', required: false, type: Number, default: 10 })
  @ApiQuery({ name: 'offset', required: false, type: Number, default: 0 })
  @ApiResponse({
    status: 200,
    description: 'Lista de planos de trabalho com paginação.',
  })
  findAll(
    @Query('limit') limit: string = '10',
    @Query('offset') offset: string = '0',
  ) {
    return this.planoTrabalhoService.findAll(+limit, +offset);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtém um plano de trabalho pelo ID' })
  @ApiResponse({
    status: 200,
    description: 'Plano de trabalho encontrado.',
    type: WorkPlan,
  })
  @ApiResponse({
    status: 404,
    description: 'Plano de trabalho não encontrado.',
  })
  findOne(@Param('id') id: string) {
    return this.planoTrabalhoService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualiza um plano de trabalho pelo ID' })
  @ApiResponse({
    status: 200,
    description: 'Plano de trabalho atualizado com sucesso.',
    type: WorkPlan,
  })
  @ApiResponse({
    status: 404,
    description: 'Plano de trabalho não encontrado.',
  })
  update(
    @Param('id') id: string,
    @Body() updatePlanoTrabalhoDto: WorkPlanUpdateDto,
  ) {
    return this.planoTrabalhoService.update(+id, updatePlanoTrabalhoDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deleta um plano de trabalho pelo ID' })
  @ApiResponse({
    status: 200,
    description: 'Plano de trabalho deletado com sucesso.',
  })
  @ApiResponse({
    status: 400,
    description: 'Não é possível deletar este plano de trabalho.',
  })
  @ApiResponse({
    status: 404,
    description: 'Plano de trabalho não encontrado.',
  })
  remove(@Param('id') id: string) {
    return this.planoTrabalhoService.remove(+id);
  }
}
