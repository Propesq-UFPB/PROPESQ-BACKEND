import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  Param,
  ParseIntPipe,
  Patch,
  HttpCode,
  HttpStatus,
  Delete,
} from '@nestjs/common';
import { CreateResearchDto } from './dto/create-research.dto';
import { ResearchService } from './research.service';
import { PaginatedDto } from '../common/dto/paginated.dto';
import { findOneResearchDto } from './dto/find-one-research.dto';
import { projeto_pesquisa } from '@prisma/client';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { updateResearchDto } from './dto/update-research.dto';

@ApiBearerAuth('bearer')
@ApiTags('Projetos de pesquisa')
@Controller('research-projects')
export class ResearchController {
  constructor(private readonly researchService: ResearchService) {}

  @Post()
  @ApiOperation({ summary: 'Cria um novo projeto de pesquisa' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Projeto de pesquisa criado com sucesso.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Unidade acadêmica não encontrada.',
  })
  create(@Body() createResearchDto: CreateResearchDto): Promise<projeto_pesquisa> {
    return this.researchService.create(createResearchDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Retorna todos os projetos de pesquisa com paginação',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista paginada de projetos de pesquisa retornada com sucesso.',
  })
  @ApiQuery({ name: 'limit', required: false, type: Number, default: 10 })
  @ApiQuery({ name: 'offset', required: false, type: Number, default: 0 })
  findAll(
    @Query('limit') limit: string = '10',
    @Query('offset') offset: string = '0',
  ): Promise<PaginatedDto<findOneResearchDto>> {
    return this.researchService.findAll(+limit, +offset);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retorna dados de um projeto de pesquisa pelo ID' })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID do projeto de pesquisa.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Projeto de pesquisa retornado com sucesso.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Projeto de pesquisa não encontrado.',
  })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<findOneResearchDto> {
    return this.researchService.findOne(id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Atualiza registro de um projeto de pesquisa' })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID do projeto de pesquisa.',
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Projeto de pesquisa atualizado com sucesso.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Projeto de pesquisa não encontrado.',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateResearchDto: updateResearchDto,
  ): Promise<void> {
    await this.researchService.update(id, updateResearchDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Exclui registro de um projeto de pesquisa' })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID do projeto de pesquisa.',
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Projeto de pesquisa excluido com sucesso.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Projeto de pesquisa não encontrado.',
  })
  async delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.researchService.delete(id);
  }
}
