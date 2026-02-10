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
import { SchedulesService } from './schedules.service';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { Schedule } from './entities/schedules.entity';

@ApiTags('schedules')
@ApiBearerAuth('bearer')
@Controller('schedules')
export class SchedulesController {
  constructor(private readonly schedulesService: SchedulesService) {}

  @Post()
  @ApiOperation({ summary: 'Cria um novo cronograma' })
  @ApiResponse({ status: 201, description: 'Cronograma criado com sucesso.' })
  @ApiResponse({ status: 400, description: 'Requisição inválida.' })
  @ApiResponse({ status: 404, description: 'Atividade não encontrada.' })
  create(@Body() createScheduleDto: CreateScheduleDto) {
    return this.schedulesService.create(createScheduleDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtém todos os cronogramas com paginação' })
  @ApiQuery({ name: 'limit', required: false, type: Number, default: 10 })
  @ApiQuery({ name: 'offset', required: false, type: Number, default: 0 })
  @ApiResponse({
    status: 200,
    description: 'Lista de cronogramas com paginação.',
  })
  findAll(
    @Query('limit') limit: string = '10',
    @Query('offset') offset: string = '0',
  ) {
    return this.schedulesService.findAll(+limit, +offset);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtém um cronograma pelo ID' })
  @ApiResponse({
    status: 200,
    description: 'Cronograma encontrado.',
    type: Schedule,
  })
  @ApiResponse({ status: 404, description: 'Cronograma não encontrado.' })
  findOne(@Param('id') id: string) {
    return this.schedulesService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualiza um cronograma pelo ID' })
  @ApiResponse({
    status: 200,
    description: 'Cronograma atualizado com sucesso.',
  })
  @ApiResponse({ status: 404, description: 'Cronograma não encontrado.' })
  update(
    @Param('id') id: string,
    @Body() updateScheduleDto: UpdateScheduleDto,
  ) {
    return this.schedulesService.update(+id, updateScheduleDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deleta um cronograma pelo ID' })
  @ApiResponse({
    status: 200,
    description: 'Cronograma deletado com sucesso.',
  })
  @ApiResponse({ status: 404, description: 'Cronograma não encontrado.' })
  remove(@Param('id') id: string) {
    return this.schedulesService.remove(+id);
  }
}
