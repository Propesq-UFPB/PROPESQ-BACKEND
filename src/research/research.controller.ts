import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { CreateResearchDto } from './dto/create-research.dto';
import { ResearchService } from './research.service';
import { PaginatedDto } from 'src/common/dto/paginated.dto';
import { findOneResearchDto } from './dto/find-one-research.dto';
import { projeto_pesquisa } from '@prisma/client';
import {
  ApiOkResponse,
  ApiOperation,
  ApiProperty,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';

@Controller('research')
export class ResearchController {
  constructor(private readonly researchService: ResearchService) {}

  @Post()
  @ApiOperation({ summary: 'Cria um novo projeto de pesquisa' })
  create(
    @Body() createResearchDto: CreateResearchDto,
  ): Promise<projeto_pesquisa> {
    return this.researchService.create(createResearchDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Retorna todos os projetos de pesquisa com paginação',
  })
  @ApiOkResponse({ type: findOneResearchDto })
  @ApiQuery({ name: 'limit', required: false, type: Number, default: 10 })
  @ApiQuery({ name: 'offset', required: false, type: Number, default: 0 })
  findAll(
    @Query('limit') limit: string = '10',
    @Query('offset') offset: string = '0',
  ): Promise<PaginatedDto<findOneResearchDto>> {
    return this.researchService.findAll(+limit, +offset);
  }
}
