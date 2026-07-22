import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { StatusRelatorio } from '@prisma/client';
import { Paginated, PaginatedResult } from '../common/dto/paginated.dto';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { ReportResponseDto } from './dto/report-response.dto';
import { ReportsService } from './reports.service';

@ApiBearerAuth('bearer')
@ApiTags('Relatórios')
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @ApiOperation({ summary: 'Cria um relatório' })
  @ApiResponse({ status: HttpStatus.CREATED, type: ReportResponseDto })
  @Post()
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'GESTOR')
  create(@Body() dto: CreateReportDto): Promise<ReportResponseDto> {
    return this.reportsService.create(dto);
  }

  @ApiOperation({ summary: 'Lista relatórios' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, enum: StatusRelatorio })
  @ApiResponse({ status: HttpStatus.OK, type: Paginated(ReportResponseDto) })
  @Get()
  findAll(
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset: number,
    @Query('status') status?: StatusRelatorio,
  ): Promise<PaginatedResult<ReportResponseDto>> {
    return this.reportsService.findAll(limit, offset, status);
  }

  @ApiOperation({ summary: 'Obtém um relatório pelo ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: HttpStatus.OK, type: ReportResponseDto })
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<ReportResponseDto> {
    return this.reportsService.findOne(id);
  }

  @ApiOperation({ summary: 'Atualiza um relatório (ex.: status)' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: HttpStatus.OK, type: ReportResponseDto })
  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'GESTOR')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateReportDto,
  ): Promise<ReportResponseDto> {
    return this.reportsService.update(id, dto);
  }
}
