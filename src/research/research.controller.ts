import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  Param,
  ParseIntPipe,
  Patch,
  Res,
  HttpCode,
  HttpStatus,
  Delete,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
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
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiOkResponse,
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
import {
  ResearchAttachmentResponseDto,
  ResearchGroupLookupDto,
  ResearchLookupDto,
  ResearchMemberLookupsDto,
  ResearchUserLookupDto,
} from './dto/research-lookups.dto';
import { ResearchUserLookupQueryDto } from './dto/research-user-lookup-query.dto';

type UploadedResearchFile = {
  buffer?: Buffer;
  mimetype?: string;
  originalname?: string;
};

@ApiBearerAuth('bearer')
@ApiTags('Projetos de pesquisa')
@Controller('research-projects')
export class ResearchController {
  constructor(private readonly researchService: ResearchService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles('GESTOR', 'COORDENADOR')
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

  @Get('sustainable-development-goals/lookup')
  @ApiOkResponse({ type: [ResearchLookupDto] })
  getSustainableDevelopmentGoals(): Promise<ResearchLookupDto<number>[]> {
    return this.researchService.getSustainableDevelopmentGoals();
  }

  @Get('research-groups/lookup')
  @ApiOkResponse({ type: [ResearchGroupLookupDto] })
  getResearchGroups(): Promise<ResearchGroupLookupDto[]> {
    return this.researchService.getResearchGroups();
  }

  @Get('members/lookups')
  @ApiOkResponse({ type: ResearchMemberLookupsDto })
  getMemberLookups(): ResearchMemberLookupsDto {
    return this.researchService.getMemberLookups();
  }

  @Get('members/users/lookup')
  @ApiOkResponse({ type: [ResearchUserLookupDto] })
  getUsersLookup(@Query() query: ResearchUserLookupQueryDto): Promise<ResearchUserLookupDto[]> {
    return this.researchService.getUsersLookup(query);
  }

  @Post(':id/anexo')
  @UseGuards(RolesGuard)
  @Roles('GESTOR', 'COORDENADOR')
  @UseInterceptors(FileInterceptor('arquivo', { limits: { fileSize: 10 * 1024 * 1024 } }))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['arquivo'],
      properties: {
        arquivo: { type: 'string', format: 'binary', description: 'Arquivo PDF do projeto.' },
      },
    },
  })
  @ApiCreatedResponse({ type: ResearchAttachmentResponseDto })
  uploadAttachment(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file?: UploadedResearchFile,
  ): Promise<ResearchAttachmentResponseDto> {
    return this.researchService.uploadAttachment(id, file);
  }

  @Get(':id/anexo')
  @ApiParam({ name: 'id', type: Number, description: 'ID do projeto de pesquisa.' })
  @ApiOkResponse({ description: 'PDF associado ao projeto retornado com sucesso.' })
  async getAttachment(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() currentUser: CurrentUserPayload,
    @Res({ passthrough: false }) res: Response,
  ): Promise<void> {
    const attachment = await this.researchService.getAttachment(id, currentUser);
    res.setHeader('Content-Type', attachment.tipo);
    res.setHeader(
      'Content-Disposition',
      `inline; filename="${attachment.nome.replaceAll('"', '')}"`,
    );
    res.send(attachment.arquivo);
  }

  @Get()
  @ApiOperation({
    summary: 'Retorna projetos de pesquisa com paginação',
    description:
      'COORDENADOR vê apenas projetos em que é Orientador/Coordenador/Coordenador Adjunto. GESTOR e demais roles veem a lista completa (sem filtro de membro).',
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
    @CurrentUser() currentUser: CurrentUserPayload,
  ): Promise<PaginatedResult<findOneResearchDto>> {
    return this.researchService.findAll(+limit, +offset, currentUser);
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
