import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseBoolPipe,
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
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ConsultorService } from './consultor.service';
import { CreateConsultorDto } from './dto/create-consultor.dto';
import { UpdateConsultorDto } from './dto/update-consultor.dto';
import { ConsultorResponseDto, UsuarioElegivelDto } from './dto/consultor-response.dto';
import { Paginated, PaginatedResult } from '../common/dto/paginated.dto';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiBearerAuth('bearer')
@ApiTags('Consultores')
@Controller('consultores')
export class ConsultorController {
  constructor(private readonly consultorService: ConsultorService) {}

  @ApiOperation({ summary: 'Cadastra um usuário como consultor' })
  @ApiResponse({ status: HttpStatus.CREATED, type: ConsultorResponseDto })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Dados inválidos, usuário inelegível ou área inexistente.',
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Usuário não encontrado.' })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Usuário já é consultor.' })
  @Post()
  @UseGuards(RolesGuard)
  @Roles('GESTOR')
  create(@Body() dto: CreateConsultorDto): Promise<ConsultorResponseDto> {
    return this.consultorService.create(dto);
  }

  @ApiOperation({ summary: 'Lista consultores com paginação' })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'offset', required: false, type: Number, example: 0 })
  @ApiQuery({ name: 'ativo', required: false, type: Boolean })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Nome ou e-mail.' })
  @ApiResponse({ status: HttpStatus.OK, type: Paginated(ConsultorResponseDto) })
  @Get()
  @UseGuards(RolesGuard)
  @Roles('GESTOR')
  findAll(
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset: number,
    @Query('ativo', new ParseBoolPipe({ optional: true })) ativo?: boolean,
    @Query('search') search?: string,
  ): Promise<PaginatedResult<ConsultorResponseDto>> {
    return this.consultorService.findAll(limit, offset, ativo, search);
  }

  @ApiOperation({ summary: 'Lista usuários que podem ser cadastrados como consultor' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Nome ou e-mail.' })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  @ApiResponse({ status: HttpStatus.OK, type: [UsuarioElegivelDto] })
  @Get('usuarios-elegiveis')
  @UseGuards(RolesGuard)
  @Roles('GESTOR')
  findUsuariosElegiveis(
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('search') search?: string,
  ): Promise<UsuarioElegivelDto[]> {
    return this.consultorService.findUsuariosElegiveis(search, limit);
  }

  @ApiOperation({ summary: 'Obtém um consultor pelo ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: HttpStatus.OK, type: ConsultorResponseDto })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Consultor não encontrado.' })
  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles('GESTOR')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<ConsultorResponseDto> {
    return this.consultorService.findOne(id);
  }

  @ApiOperation({ summary: 'Atualiza um consultor pelo ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: HttpStatus.OK, type: ConsultorResponseDto })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Consultor não encontrado.' })
  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('GESTOR')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateConsultorDto,
  ): Promise<ConsultorResponseDto> {
    return this.consultorService.update(id, dto);
  }

  @ApiOperation({
    summary: 'Remove um consultor pelo ID',
    description: 'Consultores com atribuições de avaliação são apenas desativados.',
  })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Consultor removido ou desativado.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Consultor não encontrado.' })
  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('GESTOR')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.consultorService.remove(id);
  }
}
