import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ResearchService } from './research.service';
import { CreateResearchDto } from './dto/create-research.dto';
import { UpdateResearchDto } from './dto/update-research.dto';
import { Research } from './entities/research.entity';

import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('research')
@Controller('research')
export class ResearchController {
  constructor(private readonly researchService: ResearchService) {}

  @Post()
  @ApiOperation({ summary: 'Cria um novo projeto.' })
  @ApiResponse({ status: 201, description: 'Projeto criado com sucesso.' })
  @ApiResponse({ status: 400, description: 'Requisição inválida.' })
  create(@Body() createResearchDto: CreateResearchDto) {
    return this.researchService.create(createResearchDto);
  }

  @Get()
  @ApiOperation({ summary: 'Lista todos os projetos.' })
  @ApiResponse({
    status: 200,
    description: 'Lista de projetos.',
    type: [Research],
  })
  findAll() {
    return this.researchService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Pesquisa um projeto pelo seu id.' })
  @ApiResponse({
    status: 200,
    description: 'Objeto com o projeto.',
    type: Research,
  })
  findOne(@Param('id') id: string) {
    return this.researchService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualiza os dados de um projeto.' })
  @ApiResponse({
    status: 200,
    description: 'Projeto atualizado',
    type: Research,
  })
  update(
    @Param('id') id: string,
    @Body() updateResearchDto: UpdateResearchDto,
  ) {
    return this.researchService.update(+id, updateResearchDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Exclui um projeto a partir do seu id.' })
  @ApiResponse({ status: 200, description: 'Projeto excluído.' })
  remove(@Param('id') id: string) {
    return this.researchService.remove(+id);
  }
}
