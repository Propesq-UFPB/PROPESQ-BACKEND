import { Body, Controller, Param, ParseIntPipe, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { DistribuicaoService } from './distribuicao.service';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { DistribuicaoParamsDto } from './dto/distribute.dto';

@ApiBearerAuth('bearer')
@ApiTags('Distribuição')
@Controller('distribuicao')
export class DistribuicaoController {
  constructor(private readonly distribuicaoService: DistribuicaoService) {}

  @Post(':editalId/distribute')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'GESTOR')
  @ApiOperation({ summary: 'Distribui projetos do edital para avaliadores' })
  @ApiParam({ name: 'editalId', type: Number })
  @ApiOkResponse({ description: 'Distribuição realizada com sucesso.' })
  async distribute(
    @Param('editalId', ParseIntPipe) editalId: number,
    @Body() params: DistribuicaoParamsDto,
  ) {
    const hasDistribuicao = await this.distribuicaoService.hasDistribuicao(editalId);

    if (hasDistribuicao) {
      return this.distribuicaoService.redistribute(editalId, params);
    }

    return this.distribuicaoService.distribute(editalId, params);
  }
}
