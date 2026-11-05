import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AvaliadoresService } from './avaliadores.service';
import {
  AddEditalAvaliadorDto,
  EditalAvaliadorResponseDto,
  SetEditalAvaliadoresDto,
} from './dto/edital-avaliador.dto';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiBearerAuth('bearer')
@ApiTags('Avaliadores')
@Controller('editais/:editalId/avaliadores')
export class EditalAvaliadoresController {
  constructor(private readonly avaliadoresService: AvaliadoresService) {}

  @ApiOperation({ summary: 'Lista os avaliadores vinculados ao edital, com a carga atual' })
  @ApiParam({ name: 'editalId', type: Number })
  @ApiResponse({ status: HttpStatus.OK, type: [EditalAvaliadorResponseDto] })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Edital não encontrado.' })
  @Get()
  @UseGuards(RolesGuard)
  @Roles('GESTOR')
  findAll(
    @Param('editalId', ParseIntPipe) editalId: number,
  ): Promise<EditalAvaliadorResponseDto[]> {
    return this.avaliadoresService.findByEdital(editalId);
  }

  @ApiOperation({ summary: 'Substitui o conjunto de avaliadores vinculados ao edital' })
  @ApiParam({ name: 'editalId', type: Number })
  @ApiResponse({ status: HttpStatus.OK, type: [EditalAvaliadorResponseDto] })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Algum avaliador a remover já tem atribuições no edital.',
  })
  @Put()
  @UseGuards(RolesGuard)
  @Roles('GESTOR')
  set(
    @Param('editalId', ParseIntPipe) editalId: number,
    @Body() dto: SetEditalAvaliadoresDto,
  ): Promise<EditalAvaliadorResponseDto[]> {
    return this.avaliadoresService.setEditalAvaliadores(editalId, dto.avaliador_cadastro_ids);
  }

  @ApiOperation({ summary: 'Vincula um avaliador ao edital' })
  @ApiParam({ name: 'editalId', type: Number })
  @ApiResponse({ status: HttpStatus.CREATED, type: EditalAvaliadorResponseDto })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Avaliador já vinculado.' })
  @Post()
  @UseGuards(RolesGuard)
  @Roles('GESTOR')
  add(
    @Param('editalId', ParseIntPipe) editalId: number,
    @Body() dto: AddEditalAvaliadorDto,
  ): Promise<EditalAvaliadorResponseDto> {
    return this.avaliadoresService.addToEdital(editalId, dto.avaliador_cadastro_id);
  }

  @ApiOperation({ summary: 'Desvincula um avaliador do edital' })
  @ApiParam({ name: 'editalId', type: Number })
  @ApiParam({ name: 'avaliadorId', type: Number })
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Avaliador desvinculado.' })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Avaliador já tem atribuições no edital.',
  })
  @Delete(':avaliadorId')
  @UseGuards(RolesGuard)
  @Roles('GESTOR')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('editalId', ParseIntPipe) editalId: number,
    @Param('avaliadorId', ParseIntPipe) avaliadorId: number,
  ): Promise<void> {
    await this.avaliadoresService.removeFromEdital(editalId, avaliadorId);
  }
}
