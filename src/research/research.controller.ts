import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  Param,
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
import {
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { updateResearchDto } from './dto/update-research.dto';

@ApiTags('Projeto de pesquisa')
@Controller('research')
export class ResearchController {
  constructor(private readonly researchService: ResearchService) {}

  @Post()
  @ApiOperation({ summary: 'Cria um novo projeto de pesquisa' })
  @ApiCreatedResponse({ description: 'Projeto criado com sucesso' })
  create(
    @Body() createResearchDto: CreateResearchDto,
  ): Promise<projeto_pesquisa> {
    return this.researchService.create(createResearchDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Retorna todos os projetos de pesquisa com paginação',
  })
  @ApiOkResponse({ type: PaginatedDto<findOneResearchDto> })
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
  @ApiOkResponse({
    description: 'Projeto de pesquisa retornado com sucesso',
    type: findOneResearchDto,
  })
  findOne(@Param('id') id: number): Promise<findOneResearchDto> {
    return this.researchService.findOne(id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Atualiza registro de um projeto de pesquisa' })
  @ApiNoContentResponse({
    description: 'Projeto de pesquisa atualizado com sucesso',
  })
  update(
    @Param('id') id: number,
    @Body() updateResearchDto: updateResearchDto,
  ) {
    return this.researchService.update(id, updateResearchDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Exclui registro de um projeto de pesquisa' })
  @ApiNoContentResponse({
    description: 'Projeto de pesquisa deletado com sucesso',
  })
  delete(@Param('id') id: number) {
    return this.researchService.delete(id);
  }
}
