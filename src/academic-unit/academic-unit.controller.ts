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
import { CreateAcademicUnitDto } from './dto/create-academic-unit.dto';
import { AcademicUnitService } from './academic-unit.service';
import { UpdateAcademicUnitDto } from './dto/update-academic-unit.dto';
import { AcademicUnitResponseDto } from './dto/academic-unit-response.dto';
import { AcademicUnitLookupDto } from './dto/academic-unit-lookup.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Paginated, PaginatedResult } from '../common/dto/paginated.dto';

@ApiBearerAuth('bearer')
@ApiTags('Unidades Acadêmicas')
@Controller('academic-units')
export class AcademicUnitsController {
  constructor(private readonly academicUnitService: AcademicUnitService) {}

  @ApiOperation({ summary: 'Cria uma nova unidade acadêmica' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Unidade acadêmica criada com sucesso.',
    type: AcademicUnitResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Dados inválidos para criação da unidade acadêmica.',
  })
  @Post()
  create(@Body() createUnit: CreateAcademicUnitDto): Promise<AcademicUnitResponseDto> {
    return this.academicUnitService.create(createUnit);
  }

  @ApiOperation({ summary: 'Lista unidades acadêmicas com paginação' })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'offset', required: false, type: Number, example: 0 })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista paginada de unidades acadêmicas retornada com sucesso.',
    type: Paginated(AcademicUnitResponseDto),
  })
  @Get()
  findAll(
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset: number,
  ): Promise<PaginatedResult<AcademicUnitResponseDto>> {
    return this.academicUnitService.findAll(limit, offset);
  }

  @ApiOperation({ summary: 'Lista unidades acadêmicas para select/dropdown (id e nome)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista completa de opções de lookup, ordenada alfabeticamente por nome.',
    type: [AcademicUnitLookupDto],
  })
  @Get('lookup')
  getLookup(): Promise<AcademicUnitLookupDto[]> {
    return this.academicUnitService.getLookup();
  }

  @ApiOperation({ summary: 'Obtém uma unidade acadêmica pelo ID' })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID da unidade acadêmica.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Unidade acadêmica retornada com sucesso.',
    type: AcademicUnitResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Unidade acadêmica não encontrada.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Parâmetro de identificação inválido.',
  })
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<AcademicUnitResponseDto> {
    return this.academicUnitService.findOne(id);
  }

  @ApiOperation({ summary: 'Atualiza uma unidade acadêmica pelo ID' })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID da unidade acadêmica.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Unidade acadêmica atualizada com sucesso.',
    type: AcademicUnitResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Unidade acadêmica não encontrada.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Dados de atualização inválidos.',
  })
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUnit: UpdateAcademicUnitDto,
  ): Promise<AcademicUnitResponseDto> {
    return this.academicUnitService.update(id, updateUnit);
  }

  @ApiOperation({ summary: 'Remove uma unidade acadêmica pelo ID' })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID da unidade acadêmica.',
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Unidade acadêmica removida com sucesso.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Unidade acadêmica não encontrada.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Parâmetro de identificação inválido.',
  })
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.academicUnitService.remove(id);
  }
}
