import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CreateAcademicUnit } from './dto/create-academic-unit.dto';
import { AcademicUnitService } from './academic-unit.service';
import { UpdateAcademicUnit } from './dto/update-academic-unit.dto';
import { unidade_academica } from '@prisma/client';
import {
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { PaginatedDto } from '../common/dto/paginated.dto';

@ApiTags('Unidade acadêmica')
@Controller('academic-unit')
export class AcademicUnitController {
  constructor(private readonly academicUnitService: AcademicUnitService) {}

  @ApiOperation({ summary: 'Cria uma unidade acadêmica' })
  @Post()
  create(@Body() createUnit: CreateAcademicUnit) {
    return this.academicUnitService.create(createUnit);
  }

  @ApiOperation({ summary: 'Obtém todos as unidades acadêmicas com paginação' })
  @ApiQuery({ name: 'limit', required: false, type: Number, default: 10 })
  @ApiQuery({ name: 'offset', required: false, type: Number, default: 0 })
  @Get()
  findAll(
    @Query('limit') limit: string = '10',
    @Query('offset') offset: string = '0',
  ): Promise<PaginatedDto<unidade_academica>> {
    return this.academicUnitService.findAll(+limit, +offset);
  }

  @ApiOperation({ summary: 'Atualiza uma unidade acadêmica' })
  @Patch(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  update(@Param('id') id: number, @Body() updateUnit: UpdateAcademicUnit) {
    return this.academicUnitService.update(id, updateUnit);
  }
}
