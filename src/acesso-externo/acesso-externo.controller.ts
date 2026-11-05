import { Body, Controller, Get, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from '../auth/decorators/public.decorator';
import { PermitirAvaliadorExterno } from '../auth/decorators/permitir-avaliador-externo.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { CurrentUserPayload } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { FUNCAO_AVALIADOR_EXTERNO } from '../auth/funcoes';
import { AcessoExternoService } from './acesso-externo.service';
import { AbrirSessaoDto, AvaliadorExternoPerfilDto, SessaoExternaDto } from './acesso-externo.dto';

/**
 * Acesso do avaliador externo, sem login: o front abre /avaliacao-externa/<token>, troca o token
 * por uma sessão aqui e usa o accessToken nas rotas liberadas (convites em
 * /distribuicao/atribuicoes/minhas, aceite e recusa).
 */
@ApiTags('Acesso de avaliador externo')
@Controller('acesso-externo')
export class AcessoExternoController {
  constructor(private readonly service: AcessoExternoService) {}

  @ApiOperation({ summary: 'Abre uma sessão a partir do token do link de acesso' })
  @ApiResponse({ status: HttpStatus.OK, type: SessaoExternaDto })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Link inválido ou expirado.' })
  @Public()
  @Post('sessao')
  @HttpCode(HttpStatus.OK)
  abrirSessao(@Body() dto: AbrirSessaoDto): Promise<SessaoExternaDto> {
    return this.service.abrirSessao(dto.token);
  }

  @ApiOperation({ summary: 'Dados do avaliador externo da sessão' })
  @ApiResponse({ status: HttpStatus.OK, type: AvaliadorExternoPerfilDto })
  @ApiBearerAuth('bearer')
  @PermitirAvaliadorExterno()
  @UseGuards(RolesGuard)
  @Roles(FUNCAO_AVALIADOR_EXTERNO)
  @Get('me')
  perfil(@CurrentUser() user: CurrentUserPayload): Promise<AvaliadorExternoPerfilDto> {
    return this.service.perfil(user.userId);
  }
}
