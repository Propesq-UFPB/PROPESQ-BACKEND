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
import { ConsultorService } from './consultor.service';
import {
  AddEditalConsultorDto,
  EditalConsultorResponseDto,
  SetEditalConsultoresDto,
} from './dto/edital-consultor.dto';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiBearerAuth('bearer')
@ApiTags('Consultores')
@Controller('editais/:editalId/consultores')
export class EditalConsultorController {
  constructor(private readonly consultorService: ConsultorService) {}

  @ApiOperation({ summary: 'Lista os consultores vinculados ao edital, com a carga atual' })
  @ApiParam({ name: 'editalId', type: Number })
  @ApiResponse({ status: HttpStatus.OK, type: [EditalConsultorResponseDto] })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Edital não encontrado.' })
  @Get()
  @UseGuards(RolesGuard)
  @Roles('GESTOR')
  findAll(
    @Param('editalId', ParseIntPipe) editalId: number,
  ): Promise<EditalConsultorResponseDto[]> {
    return this.consultorService.findByEdital(editalId);
  }

  @ApiOperation({ summary: 'Substitui o conjunto de consultores vinculados ao edital' })
  @ApiParam({ name: 'editalId', type: Number })
  @ApiResponse({ status: HttpStatus.OK, type: [EditalConsultorResponseDto] })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Algum consultor a remover já tem atribuições no edital.',
  })
  @Put()
  @UseGuards(RolesGuard)
  @Roles('GESTOR')
  set(
    @Param('editalId', ParseIntPipe) editalId: number,
    @Body() dto: SetEditalConsultoresDto,
  ): Promise<EditalConsultorResponseDto[]> {
    return this.consultorService.setEditalConsultores(editalId, dto.consultor_ids);
  }

  @ApiOperation({ summary: 'Vincula um consultor ao edital' })
  @ApiParam({ name: 'editalId', type: Number })
  @ApiResponse({ status: HttpStatus.CREATED, type: EditalConsultorResponseDto })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Consultor já vinculado.' })
  @Post()
  @UseGuards(RolesGuard)
  @Roles('GESTOR')
  add(
    @Param('editalId', ParseIntPipe) editalId: number,
    @Body() dto: AddEditalConsultorDto,
  ): Promise<EditalConsultorResponseDto> {
    return this.consultorService.addToEdital(editalId, dto.consultor_id);
  }

  @ApiOperation({ summary: 'Desvincula um consultor do edital' })
  @ApiParam({ name: 'editalId', type: Number })
  @ApiParam({ name: 'consultorId', type: Number })
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Consultor desvinculado.' })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Consultor já tem atribuições no edital.',
  })
  @Delete(':consultorId')
  @UseGuards(RolesGuard)
  @Roles('GESTOR')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('editalId', ParseIntPipe) editalId: number,
    @Param('consultorId', ParseIntPipe) consultorId: number,
  ): Promise<void> {
    await this.consultorService.removeFromEdital(editalId, consultorId);
  }
}
