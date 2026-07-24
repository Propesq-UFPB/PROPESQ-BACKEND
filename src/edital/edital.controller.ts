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
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateEditalDto } from './dto/create-edital.dto';
import {
  ApiBody,
  ApiBearerAuth,
  ApiConsumes,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { EditalService } from './edital.service';
import { UpdateEditalDto } from './dto/update-edital.dto';
import { SetEditalAcademicUnitsDto } from './dto/set-edital-academic-units.dto';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { EditalTypeLookupDto } from './dto/edital-type-lookup.dto';
import { EditalAttachmentResponseDto } from './dto/edital-attachment-response.dto';
import { EditalLookupDto } from './dto/edital-lookup.dto';
import { EditalStatusLookupDto } from './dto/edital-status-lookup.dto';
import { EditalListItemDto } from './dto/edital-list-item.dto';
import { Paginated, PaginatedResult } from '../common/dto/paginated.dto';

type UploadedEditalFile = {
  buffer?: Buffer;
  mimetype?: string;
  originalname?: string;
};

@ApiBearerAuth('bearer')
@ApiTags('Edital')
@Controller('editais')
export class EditalController {
  constructor(private readonly editalService: EditalService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'GESTOR')
  @ApiOperation({
    summary: 'Cadastra um edital como rascunho ou o publica imediatamente',
  })
  @ApiCreatedResponse({ description: 'Edital cadastrado com sucesso.' })
  async create(@Body() createEditalDto: CreateEditalDto) {
    return this.editalService.create(createEditalDto);
  }

  @Get('tipo/lookup')
  @ApiOkResponse({
    description: 'Tipos de edital retornados com sucesso.',
    type: [EditalTypeLookupDto],
  })
  getTypeLookup(): EditalTypeLookupDto[] {
    return this.editalService.getTypeLookup();
  }

  @Get('status/lookup')
  @ApiOperation({ summary: 'Lista os status disponíveis para editais' })
  @ApiOkResponse({
    description: 'Status de edital retornados com sucesso.',
    type: [EditalStatusLookupDto],
  })
  getStatusLookup(): EditalStatusLookupDto[] {
    return this.editalService.getStatusLookup();
  }

  @Get('lookup')
  @ApiOkResponse({
    description: 'Editais retornados com sucesso para lookup.',
    type: [EditalLookupDto],
  })
  getLookup(): Promise<EditalLookupDto[]> {
    return this.editalService.getLookup();
  }

  @Post(':id/anexo')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'GESTOR')
  @UseInterceptors(FileInterceptor('arquivo'))
  @ApiConsumes('multipart/form-data')
  @ApiParam({ name: 'id', type: Number, description: 'ID do edital.' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['arquivo'],
      properties: {
        arquivo: {
          type: 'string',
          format: 'binary',
          description: 'Arquivo PDF a ser vinculado ao edital.',
        },
      },
    },
  })
  @ApiCreatedResponse({
    description: 'Anexo do edital enviado com sucesso.',
    type: EditalAttachmentResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Edital não encontrado' })
  async uploadAttachment(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() arquivo?: UploadedEditalFile,
  ): Promise<EditalAttachmentResponseDto> {
    return this.editalService.uploadAttachment(id, arquivo);
  }

  @Get(':id')
  @ApiOkResponse({ description: 'Edital retornado com sucesso' })
  @ApiNotFoundResponse({ description: 'Edital não encontrado' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.editalService.findOne(id);
  }

  @Get()
  @ApiOperation({ summary: 'Lista editais com título, período de execução e status' })
  @ApiOkResponse({
    description: 'Editais retornados com sucesso',
    type: Paginated(EditalListItemDto),
  })
  @ApiQuery({ name: 'limit', required: false, type: Number, default: 10 })
  @ApiQuery({ name: 'offset', required: false, type: Number, default: 0 })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Pesquisa parcial pelo título ou status do edital.',
    example: 'publicado',
  })
  async findMany(
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset: number,
    @Query('search') search?: string,
  ): Promise<PaginatedResult<EditalListItemDto>> {
    return this.editalService.findMany(limit, offset, search);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'GESTOR')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse({ description: 'Edital deletado com sucesso' })
  @ApiNotFoundResponse({ description: 'Edital não encontrado' })
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.editalService.delete(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'GESTOR')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse({ description: 'Edital atualizado com sucesso' })
  @ApiNotFoundResponse({ description: 'Edital não encontrado' })
  @ApiOperation({
    summary: 'Atualiza o título, o período de execução ou o status do edital',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateEditalDto: UpdateEditalDto,
  ): Promise<void> {
    await this.editalService.update(id, updateEditalDto);
  }

  @Put(':id/academic-units')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'GESTOR')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse({ description: 'Unidades acadêmicas do edital atualizadas com sucesso.' })
  @ApiNotFoundResponse({ description: 'Edital ou unidade acadêmica não encontrada.' })
  async setAcademicUnits(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: SetEditalAcademicUnitsDto,
  ) {
    await this.editalService.setAcademicUnits(id, dto.unidade_ids);
  }
}
