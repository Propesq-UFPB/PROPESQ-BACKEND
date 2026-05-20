import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  Param,
  ParseIntPipe,
  Patch,
  HttpCode,
  HttpStatus,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { CurrentUserPayload } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { CreateResearchDto } from './dto/create-research.dto';
import { ResearchService } from './research.service';
import { Paginated, PaginatedResult } from '../common/dto/paginated.dto';
import { findOneResearchDto } from './dto/find-one-research.dto';
import { projeto_pesquisa } from '@prisma/client';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { updateResearchDto } from './dto/update-research.dto';
import { AssignEvaluatorDto } from './dto/assign-evaluator.dto';
import { EvaluateProjectDto } from './dto/evaluate-project.dto';
import { FinalDecisionDto } from './dto/final-decision.dto';

@ApiBearerAuth('bearer')
@ApiTags('Projetos de pesquisa')
@Controller('research-projects')
export class ResearchController {
  constructor(private readonly researchService: ResearchService) {}

  @Post()
  @ApiOperation({ summary: 'Cria um novo projeto de pesquisa' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Projeto de pesquisa criado com sucesso.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Unidade acadêmica não encontrada.',
  })
  create(@Body() createResearchDto: CreateResearchDto): Promise<projeto_pesquisa> {
    return this.researchService.create(createResearchDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Retorna todos os projetos de pesquisa com paginação',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista paginada de projetos de pesquisa retornada com sucesso.',
    type: Paginated(findOneResearchDto),
  })
  @ApiQuery({ name: 'limit', required: false, type: Number, default: 10 })
  @ApiQuery({ name: 'offset', required: false, type: Number, default: 0 })
  findAll(
    @Query('limit') limit: string = '10',
    @Query('offset') offset: string = '0',
  ): Promise<PaginatedResult<findOneResearchDto>> {
    return this.researchService.findAll(+limit, +offset);
  }

  @Get('my-evaluations')
  @UseGuards(RolesGuard)
  @Roles('COORDENADOR')
  @ApiOperation({
    summary: 'Retorna os projetos atribuídos ao coordenador autenticado',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista paginada de projetos atribuídos retornada com sucesso.',
    type: Paginated(findOneResearchDto),
  })
  @ApiQuery({ name: 'limit', required: false, type: Number, default: 10 })
  @ApiQuery({ name: 'offset', required: false, type: Number, default: 0 })
  findMyEvaluations(
    @CurrentUser() currentUser: CurrentUserPayload,
    @Query('limit') limit: string = '10',
    @Query('offset') offset: string = '0',
  ): Promise<PaginatedResult<findOneResearchDto>> {
    return this.researchService.findMyEvaluations(currentUser.userId, +limit, +offset);
  }

  @Get('ranking')
  @ApiOperation({ summary: 'Retorna o ranking de projetos aprovados' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Ranking de projetos aprovados retornado com sucesso.',
    type: Paginated(findOneResearchDto),
  })
  @ApiQuery({ name: 'limit', required: false, type: Number, default: 10 })
  @ApiQuery({ name: 'offset', required: false, type: Number, default: 0 })
  getRanking(
    @Query('limit') limit: string = '10',
    @Query('offset') offset: string = '0',
  ): Promise<PaginatedResult<findOneResearchDto>> {
    return this.researchService.getRanking(+limit, +offset);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retorna dados de um projeto de pesquisa pelo ID' })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID do projeto de pesquisa.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Projeto de pesquisa retornado com sucesso.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Projeto de pesquisa não encontrado.',
  })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<findOneResearchDto> {
    return this.researchService.findOne(id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Atualiza registro de um projeto de pesquisa' })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID do projeto de pesquisa.',
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Projeto de pesquisa atualizado com sucesso.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Projeto de pesquisa não encontrado.',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateResearchDto: updateResearchDto,
  ): Promise<void> {
    await this.researchService.update(id, updateResearchDto);
  }

  @Patch(':id/publish')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(RolesGuard)
  @Roles('COORDENADOR')
  @ApiOperation({ summary: 'Publica um projeto de pesquisa (somente coordenador)' })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID do projeto de pesquisa.',
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Projeto publicado com sucesso.',
  })
  async publish(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() currentUser: CurrentUserPayload,
  ): Promise<void> {
    await this.researchService.publish(id, currentUser);
  }

  @Patch(':id/assign-evaluator')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RolesGuard)
  @Roles('GESTOR')
  @ApiOperation({ summary: 'Atribui um avaliador a um projeto (somente gestor)' })
  @ApiParam({ name: 'id', type: Number, description: 'ID do projeto de pesquisa.' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Avaliador atribuído com sucesso.' })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Acesso negado ou usuário não é coordenador.',
  })
  async assignEvaluator(
    @Param('id', ParseIntPipe) id: number,
    @Body() assignEvaluatorDto: AssignEvaluatorDto,
  ): Promise<void> {
    await this.researchService.assignEvaluator(id, assignEvaluatorDto);
  }

  @Patch(':id/evaluate')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RolesGuard)
  @Roles('COORDENADOR')
  @ApiOperation({ summary: 'Avalia um projeto atribuído (somente coordenador)' })
  @ApiParam({ name: 'id', type: Number, description: 'ID do projeto de pesquisa.' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Projeto avaliado com sucesso.' })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'O projeto não está atribuído a este coordenador.',
  })
  async evaluateProject(
    @Param('id', ParseIntPipe) id: number,
    @Body() evaluateProjectDto: EvaluateProjectDto,
    @CurrentUser() currentUser: CurrentUserPayload,
  ): Promise<void> {
    await this.researchService.evaluateProject(id, currentUser.userId, evaluateProjectDto);
  }

  @Patch(':id/final-decision')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RolesGuard)
  @Roles('GESTOR')
  @ApiOperation({ summary: 'Regista a decisão final (deferimento/indeferimento) (somente GESTOR)' })
  @ApiParam({ name: 'id', type: Number, description: 'ID do projeto de pesquisa.' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Decisão final registada com sucesso.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Projeto não encontrado.' })
  async finalDecision(
    @Param('id', ParseIntPipe) id: number,
    @Body() finalDecisionDto: FinalDecisionDto,
    @CurrentUser() currentUser: CurrentUserPayload,
  ): Promise<void> {
    await this.researchService.finalDecision(id, currentUser.userId, finalDecisionDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Exclui registro de um projeto de pesquisa' })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID do projeto de pesquisa.',
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Projeto de pesquisa excluido com sucesso.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Projeto de pesquisa não encontrado.',
  })
  async delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.researchService.delete(id);
  }
}
