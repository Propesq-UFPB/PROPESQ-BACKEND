import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { PaginatedDto } from '../common/dto/paginated.dto';
import { CreateWorkPlanDto } from './dto/create-work-plan.dto';
import { UpdateWorkPlanDto } from './dto/update-work-plan.dto';
import { WorkPlanService } from './work-plan.service';

@ApiTags('Planos de trabalho')
@ApiBearerAuth('bearer')
@Controller('work-plans')
export class WorkPlanController {
  constructor(private readonly workPlanService: WorkPlanService) {}

  @Post()
  @ApiOperation({
    summary: 'Cria um novo plano de trabalho com corpo e atividades',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Plano de trabalho criado com sucesso.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Entidade relacionada não encontrada.',
  })
  create(@Body() createWorkPlanDto: CreateWorkPlanDto) {
    return this.workPlanService.create(createWorkPlanDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtém todos os planos de trabalho com paginação' })
  @ApiQuery({ name: 'limit', required: false, type: Number, default: 10 })
  @ApiQuery({ name: 'offset', required: false, type: Number, default: 0 })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista paginada de planos de trabalho retornada com sucesso.',
  })
  findAll(
    @Query('limit') limit: string = '10',
    @Query('offset') offset: string = '0',
  ): Promise<PaginatedDto<any>> {
    return this.workPlanService.findAll(+limit, +offset);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtém um plano de trabalho pelo ID' })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID do plano de trabalho.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Plano de trabalho retornado com sucesso.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Plano de trabalho não encontrado.',
  })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.workPlanService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualiza um plano de trabalho pelo ID' })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID do plano de trabalho.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Plano de trabalho atualizado com sucesso.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Plano de trabalho não encontrado.',
  })
  update(@Param('id', ParseIntPipe) id: number, @Body() updateWorkPlanDto: UpdateWorkPlanDto) {
    return this.workPlanService.update(id, updateWorkPlanDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove um plano de trabalho pelo ID' })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID do plano de trabalho.',
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Plano de trabalho removido com sucesso.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Plano de trabalho não encontrado.',
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.workPlanService.remove(id);
  }
}
