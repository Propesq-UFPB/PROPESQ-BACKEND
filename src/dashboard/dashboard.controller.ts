import {
  Controller,
  DefaultValuePipe,
  Get,
  HttpStatus,
  ParseIntPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { DashboardSummaryDto } from './dto/dashboard-summary.dto';
import { DashboardService } from './dashboard.service';

@ApiBearerAuth('bearer')
@ApiTags('Dashboard')
@Controller('dashboard')
@UseGuards(RolesGuard)
@Roles('ADMIN', 'GESTOR')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @ApiOperation({ summary: 'Resumo de KPIs e próximos prazos do painel admin' })
  @ApiQuery({
    name: 'upcomingDays',
    required: false,
    type: Number,
    example: 60,
    description: 'Janela em dias para próximos prazos (padrão 60).',
  })
  @ApiResponse({ status: HttpStatus.OK, type: DashboardSummaryDto })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Sem permissão.' })
  @Get('summary')
  getSummary(
    @Query('upcomingDays', new DefaultValuePipe(60), ParseIntPipe)
    upcomingDays: number,
  ): Promise<DashboardSummaryDto> {
    return this.dashboardService.getSummary(upcomingDays);
  }
}
