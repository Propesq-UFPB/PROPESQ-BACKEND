import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CreateAcademicUnit } from './dto/create-academic-unit.dto';
import { AcademicUnitService } from './academic-unit.service';
import { UpdateAcademicUnit } from './dto/update-academic-unit.dto';
import { unidade_academica } from '@prisma/client';
import { ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PaginatedDto } from '../common/dto/paginated.dto';

@ApiTags('Unidades acadêmicas')
@Controller('academic-units')
export class AcademicUnitController {
  constructor(private readonly academicUnitService: AcademicUnitService) {}

  @ApiOperation({ summary: 'Cria uma unidade acadêmica' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Unidade acadêmica criada com sucesso.',
  })
  @Post()
  create(@Body() createUnit: CreateAcademicUnit) {
    return this.academicUnitService.create(createUnit);
  }

  @ApiOperation({ summary: 'Lista unidades acadêmicas com paginação' })
  @ApiQuery({ name: 'limit', required: false, type: Number, default: 10 })
  @ApiQuery({ name: 'offset', required: false, type: Number, default: 0 })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista paginada de unidades acadêmicas retornada com sucesso.',
  })
  @Get()
  findAll(
    @Query('limit') limit: string = '10',
    @Query('offset') offset: string = '0',
  ): Promise<PaginatedDto<unidade_academica>> {
    return this.academicUnitService.findAll(+limit, +offset);
  }

  @ApiOperation({ summary: 'Atualiza uma unidade acadêmica' })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID da unidade acadêmica.',
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Unidade acadêmica atualizada com sucesso.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Unidade acadêmica não encontrada.',
  })
  @Patch(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUnit: UpdateAcademicUnit,
  ): Promise<void> {
    await this.academicUnitService.update(id, updateUnit);
  }
}
