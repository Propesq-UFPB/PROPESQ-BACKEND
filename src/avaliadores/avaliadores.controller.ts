import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
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
import { AvaliadoresService } from './avaliadores.service';
import { CreateAvaliadorDto } from './dto/create-avaliador.dto';
import { ListAvaliadoresQueryDto } from './dto/list-avaliadores-query.dto';
import { UpdateAvaliadorDto } from './dto/update-avaliador.dto';
import { UpdateMinhasAreasDto } from './dto/update-minhas-areas.dto';
import {
  AvaliadorResponseDto,
  MinhasAreasResponseDto,
  UsuarioElegivelDto,
} from './dto/avaliador-response.dto';
import { Paginated, PaginatedResult } from '../common/dto/paginated.dto';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { CurrentUserPayload } from '../auth/decorators/current-user.decorator';

@ApiBearerAuth('bearer')
@ApiTags('Avaliadores')
@Controller('avaliadores')
export class AvaliadoresController {
  constructor(private readonly avaliadoresService: AvaliadoresService) {}

  @ApiOperation({ summary: 'Cadastra um usuário como avaliador' })
  @ApiResponse({ status: HttpStatus.CREATED, type: AvaliadorResponseDto })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Dados inválidos, usuário inelegível ou área inexistente.',
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Usuário não encontrado.' })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Usuário já é avaliador.' })
  @Post()
  @UseGuards(RolesGuard)
  @Roles('GESTOR')
  create(@Body() dto: CreateAvaliadorDto): Promise<AvaliadorResponseDto> {
    return this.avaliadoresService.create(dto);
  }

  @ApiOperation({ summary: 'Lista avaliadores com filtros e paginação' })
  @ApiResponse({ status: HttpStatus.OK, type: Paginated(AvaliadorResponseDto) })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Filtros inválidos.' })
  @Get()
  @UseGuards(RolesGuard)
  @Roles('GESTOR')
  findAll(@Query() query: ListAvaliadoresQueryDto): Promise<PaginatedResult<AvaliadorResponseDto>> {
    return this.avaliadoresService.findAll(query);
  }

  @ApiOperation({ summary: 'Lista usuários que podem ser cadastrados como avaliador' })
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
    return this.avaliadoresService.findUsuariosElegiveis(search, limit);
  }

  @ApiOperation({ summary: 'Obtém as áreas de avaliação do usuário logado' })
  @ApiResponse({ status: HttpStatus.OK, type: MinhasAreasResponseDto })
  @Get('me')
  @UseGuards(RolesGuard)
  @Roles('GESTOR', 'COORDENADOR')
  findMinhasAreas(@CurrentUser() user: CurrentUserPayload): Promise<MinhasAreasResponseDto> {
    return this.avaliadoresService.findMinhasAreas(user.userId);
  }

  @ApiOperation({
    summary: 'Atualiza as áreas de avaliação do usuário logado',
    description: 'Cria o cadastro de avaliador caso o usuário ainda não possua.',
  })
  @ApiResponse({ status: HttpStatus.OK, type: MinhasAreasResponseDto })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Área inexistente.' })
  @Put('me')
  @UseGuards(RolesGuard)
  @Roles('GESTOR', 'COORDENADOR')
  updateMinhasAreas(
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: UpdateMinhasAreasDto,
  ): Promise<MinhasAreasResponseDto> {
    return this.avaliadoresService.updateMinhasAreas(user.userId, dto);
  }

  @ApiOperation({ summary: 'Obtém um avaliador pelo ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: HttpStatus.OK, type: AvaliadorResponseDto })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Avaliador não encontrado.' })
  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles('GESTOR')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<AvaliadorResponseDto> {
    return this.avaliadoresService.findOne(id);
  }

  @ApiOperation({ summary: 'Atualiza um avaliador pelo ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: HttpStatus.OK, type: AvaliadorResponseDto })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Avaliador não encontrado.' })
  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('GESTOR')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAvaliadorDto,
  ): Promise<AvaliadorResponseDto> {
    return this.avaliadoresService.update(id, dto);
  }

  @ApiOperation({
    summary: 'Remove um avaliador pelo ID',
    description: 'Avaliadores com atribuições de avaliação são apenas desativados.',
  })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Avaliador removido ou desativado.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Avaliador não encontrado.' })
  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('GESTOR')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.avaliadoresService.remove(id);
  }
}
