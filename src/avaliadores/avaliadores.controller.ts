import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { AvaliadoresService } from './avaliadores.service';
import { AvaliadorListResponseDto, AvaliadorResponseDto } from './dto/avaliador-response.dto';
import { CreateAvaliadorDto } from './dto/create-avaliador.dto';
import { ListAvaliadoresQueryDto } from './dto/list-avaliadores-query.dto';
import { UpdateAvaliadorDto } from './dto/update-avaliador.dto';

@ApiBearerAuth('bearer')
@ApiTags('Avaliadores')
@Controller('avaliadores')
@UseGuards(RolesGuard)
@Roles('GESTOR')
export class AvaliadoresController {
  constructor(private readonly avaliadoresService: AvaliadoresService) {}

  @ApiOperation({ summary: 'Lista avaliadores com filtros e paginação' })
  @ApiOkResponse({ description: 'Página de avaliadores.', type: AvaliadorListResponseDto })
  @ApiBadRequestResponse({ description: 'Filtros inválidos.' })
  @ApiUnauthorizedResponse({ description: 'Token inválido ou ausente.' })
  @ApiForbiddenResponse({ description: 'Acesso permitido apenas para GESTOR.' })
  @Get()
  findAll(@Query() query: ListAvaliadoresQueryDto): Promise<AvaliadorListResponseDto> {
    return this.avaliadoresService.findAll(query);
  }

  @ApiOperation({ summary: 'Busca um avaliador pelo id' })
  @ApiOkResponse({ description: 'Avaliador encontrado.', type: AvaliadorResponseDto })
  @ApiBadRequestResponse({ description: 'Id inválido.' })
  @ApiUnauthorizedResponse({ description: 'Token inválido ou ausente.' })
  @ApiForbiddenResponse({ description: 'Acesso permitido apenas para GESTOR.' })
  @ApiNotFoundResponse({ description: 'Avaliador não encontrado.' })
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<AvaliadorResponseDto> {
    return this.avaliadoresService.findOne(id);
  }

  @ApiOperation({ summary: 'Atualiza um avaliador' })
  @ApiOkResponse({ description: 'Avaliador atualizado.', type: AvaliadorResponseDto })
  @ApiBadRequestResponse({ description: 'Dados inválidos.' })
  @ApiUnauthorizedResponse({ description: 'Token inválido ou ausente.' })
  @ApiForbiddenResponse({ description: 'Acesso permitido apenas para GESTOR.' })
  @ApiNotFoundResponse({ description: 'Avaliador ou área de conhecimento não encontrada.' })
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateAvaliadorDto,
  ): Promise<AvaliadorResponseDto> {
    return this.avaliadoresService.update(id, updateDto);
  }

  @ApiOperation({ summary: 'Cadastra um novo avaliador' })
  @ApiCreatedResponse({
    description: 'Avaliador cadastrado com sucesso.',
    type: AvaliadorResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Dados inválidos.' })
  @ApiUnauthorizedResponse({ description: 'Token inválido ou ausente.' })
  @ApiForbiddenResponse({ description: 'Acesso permitido apenas para GESTOR.' })
  @ApiNotFoundResponse({ description: 'Usuário ou área de conhecimento não encontrada.' })
  @ApiConflictResponse({ description: 'O usuário já está cadastrado como avaliador.' })
  @Post()
  create(@Body() createDto: CreateAvaliadorDto): Promise<AvaliadorResponseDto> {
    return this.avaliadoresService.create(createDto);
  }
}
