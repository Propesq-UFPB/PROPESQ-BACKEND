import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { DistribuicaoService } from './distribuicao.service';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { DistribuicaoParamsDto } from './dto/distribute.dto';
import { ConfirmDistribuicaoDto } from './dto/confirm-distribuicao.dto';
import {
  AtribuicaoAvaliadorDto,
  CandidatoDto,
  DistribuicaoConfirmResultDto,
  DistribuicaoPanoramaDto,
  DistribuicaoPreviewDto,
  ProjetoAtribuicaoDto,
} from './dto/distribuicao-response.dto';

@ApiBearerAuth('bearer')
@ApiTags('Distribuição')
@Controller('distribuicao')
export class DistribuicaoController {
  constructor(private readonly distribuicaoService: DistribuicaoService) {}

  @Get('projetos/:projetoId/atribuicoes')
  @UseGuards(RolesGuard)
  @Roles('GESTOR')
  @ApiOperation({ summary: 'Lista os convites de avaliação de um projeto' })
  @ApiParam({ name: 'projetoId', type: Number })
  @ApiOkResponse({ type: [ProjetoAtribuicaoDto] })
  atribuicoesDoProjeto(
    @Param('projetoId', ParseIntPipe) projetoId: number,
  ): Promise<ProjetoAtribuicaoDto[]> {
    return this.distribuicaoService.atribuicoesDoProjeto(projetoId);
  }

  @Get('consultores/:consultorId/atribuicoes')
  @UseGuards(RolesGuard)
  @Roles('GESTOR')
  @ApiOperation({ summary: 'Lista os convites de avaliação de um consultor' })
  @ApiParam({ name: 'consultorId', type: Number })
  @ApiQuery({ name: 'edital_id', required: false, type: Number })
  @ApiOkResponse({ type: [AtribuicaoAvaliadorDto] })
  atribuicoesDoConsultor(
    @Param('consultorId', ParseIntPipe) consultorId: number,
    @Query('edital_id', new ParseIntPipe({ optional: true })) editalId?: number,
  ): Promise<AtribuicaoAvaliadorDto[]> {
    return this.distribuicaoService.atribuicoesDoConsultor(consultorId, editalId);
  }

  @Get(':editalId')
  @UseGuards(RolesGuard)
  @Roles('GESTOR')
  @ApiOperation({
    summary: 'Panorama da distribuição do edital: projetos aptos e atribuições (convites)',
  })
  @ApiParam({ name: 'editalId', type: Number })
  @ApiOkResponse({ type: DistribuicaoPanoramaDto })
  panorama(@Param('editalId', ParseIntPipe) editalId: number): Promise<DistribuicaoPanoramaDto> {
    return this.distribuicaoService.panorama(editalId);
  }

  @Post(':editalId/preview')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RolesGuard)
  @Roles('GESTOR')
  @ApiOperation({
    summary: 'Calcula uma prévia da distribuição dos projetos do edital entre os consultores',
    description:
      'Não grava nada. Convites pendentes e aceitos são mantidos e apenas as vagas abertas (inclusive as liberadas por recusas) são preenchidas.',
  })
  @ApiParam({ name: 'editalId', type: Number })
  @ApiOkResponse({ type: DistribuicaoPreviewDto })
  preview(
    @Param('editalId', ParseIntPipe) editalId: number,
    @Body() params: DistribuicaoParamsDto,
  ): Promise<DistribuicaoPreviewDto> {
    return this.distribuicaoService.preview(editalId, params);
  }

  @Post(':editalId/confirm')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RolesGuard)
  @Roles('GESTOR')
  @ApiOperation({
    summary: 'Grava o conjunto final de atribuições do edital',
    description:
      'Sincroniza as atribuições do edital com a lista enviada. Novas atribuições viram convites pendentes; as com notas e as recusadas são sempre preservadas.',
  })
  @ApiParam({ name: 'editalId', type: Number })
  @ApiOkResponse({ type: DistribuicaoConfirmResultDto })
  confirm(
    @Param('editalId', ParseIntPipe) editalId: number,
    @Body() dto: ConfirmDistribuicaoDto,
  ): Promise<DistribuicaoConfirmResultDto> {
    return this.distribuicaoService.confirm(editalId, dto);
  }

  @Get(':editalId/candidatos/:projetoId')
  @UseGuards(RolesGuard)
  @Roles('GESTOR')
  @ApiOperation({ summary: 'Lista consultores do edital aptos a avaliar o projeto, por afinidade' })
  @ApiParam({ name: 'editalId', type: Number })
  @ApiParam({ name: 'projetoId', type: Number })
  @ApiOkResponse({ type: [CandidatoDto] })
  candidatos(
    @Param('editalId', ParseIntPipe) editalId: number,
    @Param('projetoId', ParseIntPipe) projetoId: number,
  ): Promise<CandidatoDto[]> {
    return this.distribuicaoService.candidatos(editalId, projetoId);
  }
}
