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
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { EditalService } from './edital.service';
import { UpdateEditalDto } from './dto/update-edital.dto';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { EditalTypeLookupDto } from './dto/edital-type-lookup.dto';
import { EditalAttachmentResponseDto } from './dto/edital-attachment-response.dto';
import { EditalLookupDto } from './dto/edital-lookup.dto';

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
  async findOne(@Param('id') id: number) {
    return this.editalService.findOne(id);
  }

  @Get()
  @ApiOkResponse({ description: 'Editais retornados com sucesso' })
  @ApiQuery({ name: 'limit', required: false, type: Number, default: 10 })
  @ApiQuery({ name: 'offset', required: false, type: Number, default: 0 })
  async findMany(@Query('limit') limit: string, @Query('offset') offset: string) {
    return this.editalService.findMany(+limit, +offset);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'GESTOR')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse({ description: 'Edital deletado com sucesso' })
  @ApiNotFoundResponse({ description: 'Edital não encontrado' })
  async delete(@Param('id') id: number) {
    return this.editalService.delete(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'GESTOR')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse({ description: 'Edital atualizado com sucesso' })
  @ApiNotFoundResponse({ description: 'Edital não encontrado' })
  async update(@Param('id') id: number, @Body() updateEditalDto: UpdateEditalDto) {
    return this.editalService.update(id, updateEditalDto);
  }

  //@Get()
}
