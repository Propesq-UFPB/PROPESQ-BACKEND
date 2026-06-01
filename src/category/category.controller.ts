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
  Query,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { Paginated, PaginatedResult } from '../common/dto/paginated.dto';

import { CategoryResponseDto } from './dto/category-response.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryService } from './category.service';

@ApiBearerAuth('bearer')
@ApiTags('Categorias')
@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @ApiOperation({ summary: 'Cria uma nova categoria' })
  @ApiCreatedResponse({
    description: 'Categoria criada com sucesso.',
    type: CategoryResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Dados inválidos para criação da categoria.',
  })
  @Post()
  create(@Body() createDto: CreateCategoryDto): Promise<CategoryResponseDto> {
    return this.categoryService.create(createDto);
  }

  @ApiOperation({ summary: 'Lista categorias com paginação' })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'offset', required: false, type: Number, example: 0 })
  @ApiOkResponse({
    description: 'Lista paginada de categorias retornada com sucesso.',
    type: Paginated(CategoryResponseDto),
  })
  @Get()
  findAll(
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset: number,
  ): Promise<PaginatedResult<CategoryResponseDto>> {
    return this.categoryService.findAll(limit, offset);
  }

  @ApiOperation({ summary: 'Obtém uma categoria pelo ID' })
  @ApiOkResponse({
    description: 'Categoria retornada com sucesso.',
    type: CategoryResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Categoria não encontrada.',
  })
  @ApiBadRequestResponse({
    description: 'Parâmetro de identificação inválido.',
  })
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<CategoryResponseDto> {
    return this.categoryService.findOne(id);
  }

  @ApiOperation({ summary: 'Atualiza uma categoria pelo ID' })
  @ApiNoContentResponse({
    description: 'Categoria atualizada com sucesso.',
  })
  @ApiNotFoundResponse({
    description: 'Categoria não encontrada.',
  })
  @ApiBadRequestResponse({
    description: 'Dados de atualização inválidos.',
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateCategoryDto,
  ): Promise<CategoryResponseDto> {
    return this.categoryService.update(id, updateDto);
  }

  @ApiOperation({ summary: 'Remove uma categoria pelo ID' })
  @ApiNoContentResponse({
    description: 'Categoria removida com sucesso.',
  })
  @ApiNotFoundResponse({
    description: 'Categoria não encontrada.',
  })
  @ApiBadRequestResponse({
    description: 'Parâmetro de identificação inválido.',
  })
  @ApiConflictResponse({
    description: 'Já existe um edital ou projeto de pesquisa com a categoria.',
  })
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.categoryService.remove(id);
  }
}
