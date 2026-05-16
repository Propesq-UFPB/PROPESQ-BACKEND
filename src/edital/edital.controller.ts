import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CreateEditalDto } from './dto/create-edital.dto';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { EditalService } from './edital.service';
import { UpdateEditalDto } from './dto/update-edital.dto';

@ApiBearerAuth('bearer')
@ApiTags('Edital')
@Controller('editais')
export class EditalController {
  constructor(private readonly editalService: EditalService) {}

  @Post()
  @ApiCreatedResponse({ description: 'Edital cadastrado com sucesso.' })
  async create(@Body() createEditalDto: CreateEditalDto) {
    return this.editalService.create(createEditalDto);
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
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse({ description: 'Edital deletado com sucesso' })
  @ApiNotFoundResponse({ description: 'Edital não encontrado' })
  async delete(@Param('id') id: number) {
    return this.editalService.delete(id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse({ description: 'Edital atualizado com sucesso' })
  @ApiNotFoundResponse({ description: 'Edital não encontrado' })
  async update(@Param('id') id: number, @Body() updateEditalDto: UpdateEditalDto) {
    return this.editalService.update(id, updateEditalDto);
  }
}
