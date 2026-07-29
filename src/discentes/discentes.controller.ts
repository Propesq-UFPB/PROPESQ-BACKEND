import { Body, Controller, HttpStatus, Param, ParseIntPipe, Patch, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { UpdatePerfilDiscenteDto } from '../work-plan/dto/update-perfil-discente.dto';
import { DiscentesService } from './discentes.service';

@ApiBearerAuth('bearer')
@ApiTags('Discentes')
@Controller('discentes')
export class DiscentesController {
  constructor(private readonly discentesService: DiscentesService) {}

  @Patch(':id/perfil')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'GESTOR')
  @ApiOperation({
    summary: 'Atualiza perfil acadêmico/cadastral do discente (popular dados de teste)',
  })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: HttpStatus.OK })
  @ApiResponse({ status: HttpStatus.NOT_FOUND })
  updatePerfil(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePerfilDiscenteDto,
  ) {
    return this.discentesService.updatePerfil(id, dto);
  }
}
