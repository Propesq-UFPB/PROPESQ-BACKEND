import { Body, Controller, Get, HttpStatus, Put, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UpdateResearchModuleParametersDto } from './dto/update-research-module-parameters.dto';
import { ResearchModuleParametersResponseDto } from './dto/research-module-parameters-response.dto';
import { ResearchModuleParametersService } from './research-module-parameters.service';

@ApiBearerAuth('bearer')
@ApiTags('Parâmetros do Módulo de Pesquisa')
@Controller('research-module-parameters')
export class ResearchModuleParametersController {
  constructor(
    private readonly researchModuleParametersService: ResearchModuleParametersService,
  ) {}

  @ApiOperation({ summary: 'Obtém os parâmetros globais do módulo de pesquisa' })
  @ApiResponse({ status: HttpStatus.OK, type: ResearchModuleParametersResponseDto })
  @Get()
  get(): Promise<ResearchModuleParametersResponseDto> {
    return this.researchModuleParametersService.get();
  }

  @ApiOperation({ summary: 'Atualiza os parâmetros globais do módulo de pesquisa' })
  @ApiResponse({ status: HttpStatus.OK, type: ResearchModuleParametersResponseDto })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Dados inválidos.' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Sem permissão.' })
  @Put()
  @UseGuards(RolesGuard)
  @Roles('GESTOR')
  update(
    @Body() dto: UpdateResearchModuleParametersDto,
  ): Promise<ResearchModuleParametersResponseDto> {
    return this.researchModuleParametersService.update(dto);
  }
}
