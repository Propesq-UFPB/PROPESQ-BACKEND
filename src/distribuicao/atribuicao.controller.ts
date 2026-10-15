import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { CurrentUserPayload } from '../auth/decorators/current-user.decorator';
import { DistribuicaoService } from './distribuicao.service';
import { AtribuicaoRespostaDto, AtribuicaoAvaliadorDto } from './dto/distribuicao-response.dto';
import { RecusaAtribuicaoDto } from './dto/recusa-atribuicao.dto';

@ApiBearerAuth('bearer')
@ApiTags('Distribuição')
@Controller('distribuicao/atribuicoes')
export class AtribuicaoController {
  constructor(private readonly distribuicaoService: DistribuicaoService) {}

  @Get('minhas')
  @ApiOperation({ summary: 'Lista os convites de avaliação recebidos pelo usuário autenticado' })
  @ApiOkResponse({ type: [AtribuicaoAvaliadorDto] })
  minhas(@CurrentUser() user: CurrentUserPayload): Promise<AtribuicaoAvaliadorDto[]> {
    return this.distribuicaoService.atribuicoesDoAvaliador(user.userId);
  }

  @Post(':id/aceite')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'O avaliador aceita o convite de avaliação' })
  @ApiParam({ name: 'id', type: Number, description: 'ID da atribuição (projeto_avaliacao).' })
  @ApiOkResponse({ type: AtribuicaoRespostaDto })
  aceitar(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<AtribuicaoRespostaDto> {
    return this.distribuicaoService.responder(id, user.userId, true);
  }

  @Post(':id/recusa')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'O avaliador recusa o convite de avaliação, informando o motivo' })
  @ApiParam({ name: 'id', type: Number, description: 'ID da atribuição (projeto_avaliacao).' })
  @ApiOkResponse({ type: AtribuicaoRespostaDto })
  recusar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: RecusaAtribuicaoDto,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<AtribuicaoRespostaDto> {
    return this.distribuicaoService.responder(id, user.userId, false, dto.motivo);
  }
}
