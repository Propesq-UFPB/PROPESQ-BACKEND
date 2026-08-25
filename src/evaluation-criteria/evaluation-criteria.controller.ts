import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseBoolPipe,
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
import { EvaluationCriteriaService } from './evaluation-criteria.service';
import { CreateEvaluationCriterionDto } from './dto/create-evaluation-criterion.dto';
import { UpdateEvaluationCriterionDto } from './dto/update-evaluation-criterion.dto';
import { EvaluationCriterionResponseDto } from './dto/evaluation-criterion-response.dto';
import { EvaluationCriterionLookupDto } from './dto/evaluation-criterion-lookup.dto';
import { Paginated, PaginatedResult } from '../common/dto/paginated.dto';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiBearerAuth('bearer')
@ApiTags('Critérios de Avaliação')
@Controller('evaluation-criteria')
export class EvaluationCriteriaController {
  constructor(private readonly evaluationCriteriaService: EvaluationCriteriaService) {}

  @ApiOperation({ summary: 'Cria um novo critério de avaliação' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Critério de avaliação criado com sucesso.',
    type: EvaluationCriterionResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Dados inválidos para criação do critério.',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Já existe um critério com o mesmo nome.',
  })
  @Post()
  @UseGuards(RolesGuard)
  @Roles('GESTOR')
  create(@Body() createDto: CreateEvaluationCriterionDto): Promise<EvaluationCriterionResponseDto> {
    return this.evaluationCriteriaService.create(createDto);
  }

  @ApiOperation({ summary: 'Lista critérios de avaliação com paginação' })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'offset', required: false, type: Number, example: 0 })
  @ApiQuery({
    name: 'ativo',
    required: false,
    type: Boolean,
    description: 'Filtra por critérios ativos ou inativos.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista paginada de critérios retornada com sucesso.',
    type: Paginated(EvaluationCriterionResponseDto),
  })
  @Get()
  findAll(
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset: number,
    @Query('ativo', new ParseBoolPipe({ optional: true })) ativo?: boolean,
  ): Promise<PaginatedResult<EvaluationCriterionResponseDto>> {
    return this.evaluationCriteriaService.findAll(limit, offset, ativo);
  }

  @ApiOperation({ summary: 'Lista critérios ativos para select/dropdown (id e nome)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de opções de lookup, ordenada alfabeticamente por nome.',
    type: [EvaluationCriterionLookupDto],
  })
  @Get('lookup')
  getLookup(): Promise<EvaluationCriterionLookupDto[]> {
    return this.evaluationCriteriaService.getLookup();
  }

  @ApiOperation({ summary: 'Obtém um critério de avaliação pelo ID' })
  @ApiParam({ name: 'id', type: Number, description: 'ID do critério de avaliação.' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Critério retornado com sucesso.',
    type: EvaluationCriterionResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Critério de avaliação não encontrado.',
  })
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<EvaluationCriterionResponseDto> {
    return this.evaluationCriteriaService.findOne(id);
  }

  @ApiOperation({ summary: 'Atualiza um critério de avaliação pelo ID' })
  @ApiParam({ name: 'id', type: Number, description: 'ID do critério de avaliação.' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Critério atualizado com sucesso.',
    type: EvaluationCriterionResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Critério de avaliação não encontrado.',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Já existe um critério com o mesmo nome.',
  })
  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('GESTOR')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateEvaluationCriterionDto,
  ): Promise<EvaluationCriterionResponseDto> {
    return this.evaluationCriteriaService.update(id, updateDto);
  }

  @ApiOperation({ summary: 'Desativa um critério de avaliação pelo ID (soft delete)' })
  @ApiParam({ name: 'id', type: Number, description: 'ID do critério de avaliação.' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Critério desativado com sucesso.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Critério de avaliação não encontrado.',
  })
  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('GESTOR')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.evaluationCriteriaService.remove(id);
  }
}
