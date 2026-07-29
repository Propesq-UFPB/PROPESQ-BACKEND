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
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { CurrentUserPayload } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { Paginated, PaginatedResult } from '../common/dto/paginated.dto';
import { ConfirmIndicacaoDto } from './dto/confirm-indicacao.dto';
import { CreateInteresseDto } from './dto/create-interesse.dto';
import { CreateWorkPlanDto } from './dto/create-work-plan.dto';
import { InteresseResponseDto } from './dto/interesse-response.dto';
import { UpdateWorkPlanDto } from './dto/update-work-plan.dto';
import { WorkPlanDetailResponseDto } from './dto/work-plan-detail-response.dto';
import { WorkPlanIndicacaoDetalheDto } from './dto/work-plan-indicacao-detalhe.dto';
import { WorkPlanIndicacaoItemDto } from './dto/work-plan-indicacao-item.dto';
import { WorkPlanIndicacoesQueryDto } from './dto/work-plan-indicacoes-query.dto';
import { WorkPlanListQueryDto } from './dto/work-plan-list-query.dto';
import { WorkPlanService } from './work-plan.service';

@ApiBearerAuth('bearer')
@ApiTags('Planos de trabalho')
@Controller('work-plans')
export class WorkPlanController {
  constructor(private readonly workPlanService: WorkPlanService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles('COORDENADOR', 'ADMIN', 'GESTOR')
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
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Sem permissão para criar plano neste projeto.',
  })
  create(
    @Body() createWorkPlanDto: CreateWorkPlanDto,
    @CurrentUser() currentUser: CurrentUserPayload,
  ) {
    return this.workPlanService.create(createWorkPlanDto, currentUser);
  }

  @Get()
  @ApiOperation({
    summary: 'Obtém planos de trabalho com paginação e filtros',
    description:
      'COORDENADOR vê apenas planos de projetos em que é Orientador/Coordenador/Coordenador Adjunto. ADMIN/GESTOR veem tudo (filtro usuario_id opcional).',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista paginada de planos de trabalho retornada com sucesso.',
    type: Paginated(CreateWorkPlanDto),
  })
  findAll(
    @Query() query: WorkPlanListQueryDto,
    @CurrentUser() currentUser: CurrentUserPayload,
  ): Promise<PaginatedResult<unknown>> {
    return this.workPlanService.findAll(query, currentUser);
  }

  @Get('indicacoes')
  @UseGuards(RolesGuard)
  @Roles('COORDENADOR', 'ADMIN', 'GESTOR')
  @ApiOperation({
    summary: 'Lista planos elegíveis para indicação (visão coordenador)',
    description:
      'Retorna projeto, edital, prazos, vagas, candidatos (resumo) e status de indicação. ' +
      'Escopo: ADMIN/GESTOR veem todos os elegíveis; COORDENADOR apenas projetos em que é ' +
      'Orientador, Coordenador ou Coordenador Adjunto (só Orientador se edital.apenas_orient_coordena_plano).',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista paginada de indicações.',
    type: Paginated(WorkPlanIndicacaoItemDto),
  })
  findIndicacoes(
    @Query() query: WorkPlanIndicacoesQueryDto,
    @CurrentUser() currentUser: CurrentUserPayload,
  ): Promise<PaginatedResult<WorkPlanIndicacaoItemDto>> {
    return this.workPlanService.findIndicacoes(query, currentUser);
  }

  @Get('indicacoes/:id')
  @UseGuards(RolesGuard)
  @Roles('COORDENADOR', 'ADMIN', 'GESTOR')
  @ApiOperation({
    summary: 'Detalhe de indicação com candidatos enriquecidos',
  })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Indicação do plano retornada com sucesso.',
    type: WorkPlanIndicacaoDetalheDto,
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Plano não encontrado.' })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Sem permissão para este plano.',
  })
  findIndicacaoById(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() currentUser: CurrentUserPayload,
  ): Promise<WorkPlanIndicacaoDetalheDto> {
    return this.workPlanService.findIndicacaoById(id, currentUser);
  }

  @Post(':id/indicacao')
  @UseGuards(RolesGuard)
  @Roles('COORDENADOR', 'ADMIN', 'GESTOR')
  @ApiOperation({
    summary: 'Confirma indicação de discente no plano',
    description:
      'Transiciona status para AGUARDANDO_VALIDACAO. Requer interesse APTO_PARA_INDICACAO. ' +
      'BOLSISTA exige dados bancários. Mesma regra de escopo da lista de indicações.',
  })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Indicação confirmada.',
    type: WorkPlanIndicacaoDetalheDto,
  })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST })
  @ApiResponse({ status: HttpStatus.CONFLICT })
  @ApiResponse({ status: HttpStatus.FORBIDDEN })
  @HttpCode(HttpStatus.CREATED)
  confirmIndicacao(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ConfirmIndicacaoDto,
    @CurrentUser() currentUser: CurrentUserPayload,
  ): Promise<WorkPlanIndicacaoDetalheDto> {
    return this.workPlanService.confirmIndicacao(id, dto, currentUser);
  }

  @Post(':id/interesses')
  @UseGuards(RolesGuard)
  @Roles('ALUNO', 'ADMIN', 'GESTOR')
  @ApiOperation({
    summary: 'Registra interesse de discente no plano',
    description:
      'ALUNO usa o discente vinculado ao JWT. ADMIN/GESTOR devem informar discente_id.',
  })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: InteresseResponseDto,
  })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Interesse já existe.' })
  @HttpCode(HttpStatus.CREATED)
  createInteresse(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateInteresseDto,
    @CurrentUser() currentUser: CurrentUserPayload,
  ): Promise<InteresseResponseDto> {
    return this.workPlanService.createInteresse(id, dto, currentUser);
  }

  @Get(':id/interesses')
  @UseGuards(RolesGuard)
  @Roles('COORDENADOR', 'ADMIN', 'GESTOR')
  @ApiOperation({ summary: 'Lista interesses (candidatos) do plano' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: HttpStatus.OK, type: [InteresseResponseDto] })
  listInteresses(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() currentUser: CurrentUserPayload,
  ): Promise<InteresseResponseDto[]> {
    return this.workPlanService.listInteresses(id, currentUser);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obtém um plano de trabalho pelo ID',
    description:
      'COORDENADOR só acessa planos de projetos em que é Orientador/Coordenador/Coordenador Adjunto. ' +
      'ADMIN/GESTOR acessam qualquer plano. ALUNO e demais roles autenticadas podem ler (fluxo discente).',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID do plano de trabalho.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Plano de trabalho retornado com sucesso.',
    type: WorkPlanDetailResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Plano de trabalho não encontrado.',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'COORDENADOR sem membership no projeto do plano.',
  })
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() currentUser: CurrentUserPayload,
  ) {
    return this.workPlanService.findOne(id, currentUser);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('COORDENADOR', 'ADMIN', 'GESTOR')
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
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Sem permissão para atualizar este plano.',
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateWorkPlanDto: UpdateWorkPlanDto,
    @CurrentUser() currentUser: CurrentUserPayload,
  ) {
    return this.workPlanService.update(id, updateWorkPlanDto, currentUser);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('COORDENADOR', 'ADMIN', 'GESTOR')
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
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Sem permissão para remover este plano.',
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() currentUser: CurrentUserPayload,
  ): Promise<void> {
    await this.workPlanService.remove(id, currentUser);
  }
}
