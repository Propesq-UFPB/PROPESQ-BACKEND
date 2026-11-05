import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { AvaliadoresExternosService } from './avaliadores-externos.service';
import {
  AvaliadorExternoCriadoDto,
  AvaliadorExternoResponseDto,
  CreateAvaliadorExternoDto,
  GerarLinkDto,
  LinkAcessoDto,
  UpdateAvaliadorExternoDto,
} from './dto/avaliador-externo.dto';

/**
 * Avaliadores de fora do sistema: não têm login e acessam por um link com token.
 * A listagem é a de GET /avaliadores?tipo=EXTERNO; vínculo a editais, distribuição e
 * PATCH/DELETE /avaliadores/:id funcionam como para os internos.
 */
@ApiBearerAuth('bearer')
@ApiTags('Avaliadores externos')
@Controller('avaliadores/externos')
@UseGuards(RolesGuard)
@Roles('GESTOR')
export class AvaliadoresExternosController {
  constructor(private readonly service: AvaliadoresExternosService) {}

  @ApiOperation({
    summary: 'Cadastra um avaliador externo e gera o link de acesso',
    description: 'O link (url) só é exibido nesta resposta e ao gerar um novo.',
  })
  @ApiResponse({ status: HttpStatus.CREATED, type: AvaliadorExternoCriadoDto })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'E-mail já cadastrado.' })
  @Post()
  create(@Body() dto: CreateAvaliadorExternoDto): Promise<AvaliadorExternoCriadoDto> {
    return this.service.create(dto);
  }

  @ApiOperation({ summary: 'Obtém um avaliador externo, com a situação do link de acesso' })
  @ApiResponse({ status: HttpStatus.OK, type: AvaliadorExternoResponseDto })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Avaliador externo não encontrado.' })
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<AvaliadorExternoResponseDto> {
    return this.service.findOne(id);
  }

  @ApiOperation({ summary: 'Atualiza os dados de um avaliador externo' })
  @ApiResponse({ status: HttpStatus.OK, type: AvaliadorExternoResponseDto })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'E-mail já cadastrado.' })
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAvaliadorExternoDto,
  ): Promise<AvaliadorExternoResponseDto> {
    return this.service.update(id, dto);
  }

  @ApiOperation({
    summary: 'Gera um novo link de acesso',
    description: 'Revoga os links anteriores. O novo link só é exibido nesta resposta.',
  })
  @ApiResponse({ status: HttpStatus.CREATED, type: LinkAcessoDto })
  @Post(':id/link')
  gerarLink(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: GerarLinkDto,
  ): Promise<LinkAcessoDto> {
    return this.service.gerarLink(id, dto.expira_em);
  }

  @ApiOperation({ summary: 'Revoga o link de acesso vigente' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Link revogado.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Sem link válido.' })
  @Delete(':id/link')
  @HttpCode(HttpStatus.NO_CONTENT)
  revogarLink(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.service.revogarLink(id);
  }
}
