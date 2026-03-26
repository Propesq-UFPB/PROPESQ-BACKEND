import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { PaginatedDto } from '../common/dto/paginated.dto';
import { CreateWorkPlanDto } from './dto/create-work-plan.dto';
import { UpdateWorkPlanDto } from './dto/update-work-plan.dto';
import { WorkPlanService } from './work-plan.service';

@ApiTags('work-plan')
@ApiBearerAuth('bearer')
@Controller('work-plan')
export class WorkPlanController {
  constructor(private readonly workPlanService: WorkPlanService) {}

  @Post()
  @ApiOperation({
    summary: 'Cria um novo plano de trabalho com corpo e atividades',
  })
  @ApiResponse({
    status: 201,
    description: 'Plano de trabalho criado com sucesso.',
  })
  create(@Body() createWorkPlanDto: CreateWorkPlanDto) {
    return this.workPlanService.create(createWorkPlanDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtém todos os planos de trabalho com paginação' })
  @ApiQuery({ name: 'limit', required: false, type: Number, default: 10 })
  @ApiQuery({ name: 'offset', required: false, type: Number, default: 0 })
  findAll(
    @Query('limit') limit: string = '10',
    @Query('offset') offset: string = '0',
  ): Promise<PaginatedDto<any>> {
    return this.workPlanService.findAll(+limit, +offset);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtém um plano de trabalho pelo ID' })
  findOne(@Param('id') id: string) {
    return this.workPlanService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualiza um plano de trabalho pelo ID' })
  update(
    @Param('id') id: string,
    @Body() updateWorkPlanDto: UpdateWorkPlanDto,
  ) {
    return this.workPlanService.update(+id, updateWorkPlanDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove um plano de trabalho pelo ID' })
  remove(@Param('id') id: string) {
    return this.workPlanService.remove(+id);
  }
}
