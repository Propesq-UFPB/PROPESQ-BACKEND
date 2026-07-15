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
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { DepartmentService } from './department.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { DepartmentResponseDto } from './dto/department-response.dto';

@ApiBearerAuth('bearer')
@ApiTags('Departamentos')
@Controller('academic-units/:unitId/departments')
export class DepartmentController {
  constructor(private readonly departmentService: DepartmentService) {}

  @ApiOperation({ summary: 'Lista departamentos de uma unidade acadêmica' })
  @ApiParam({ name: 'unitId', type: Number })
  @ApiResponse({ status: HttpStatus.OK, type: [DepartmentResponseDto] })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Unidade não encontrada.' })
  @Get()
  findAll(
    @Param('unitId', ParseIntPipe) unitId: number,
  ): Promise<DepartmentResponseDto[]> {
    return this.departmentService.findAllByUnit(unitId);
  }

  @ApiOperation({ summary: 'Obtém um departamento pelo ID' })
  @ApiParam({ name: 'unitId', type: Number })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: HttpStatus.OK, type: DepartmentResponseDto })
  @ApiResponse({ status: HttpStatus.NOT_FOUND })
  @Get(':id')
  findOne(
    @Param('unitId', ParseIntPipe) unitId: number,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<DepartmentResponseDto> {
    return this.departmentService.findOne(unitId, id);
  }

  @ApiOperation({ summary: 'Cria um departamento na unidade acadêmica' })
  @ApiParam({ name: 'unitId', type: Number })
  @ApiResponse({ status: HttpStatus.CREATED, type: DepartmentResponseDto })
  @ApiResponse({ status: HttpStatus.NOT_FOUND })
  @ApiResponse({ status: HttpStatus.CONFLICT })
  @Post()
  create(
    @Param('unitId', ParseIntPipe) unitId: number,
    @Body() dto: CreateDepartmentDto,
  ): Promise<DepartmentResponseDto> {
    return this.departmentService.create(unitId, dto);
  }

  @ApiOperation({ summary: 'Atualiza um departamento' })
  @ApiParam({ name: 'unitId', type: Number })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: HttpStatus.OK, type: DepartmentResponseDto })
  @ApiResponse({ status: HttpStatus.NOT_FOUND })
  @ApiResponse({ status: HttpStatus.CONFLICT })
  @Patch(':id')
  update(
    @Param('unitId', ParseIntPipe) unitId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateDepartmentDto,
  ): Promise<DepartmentResponseDto> {
    return this.departmentService.update(unitId, id, dto);
  }

  @ApiOperation({ summary: 'Remove um departamento' })
  @ApiParam({ name: 'unitId', type: Number })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: HttpStatus.NO_CONTENT })
  @ApiResponse({ status: HttpStatus.NOT_FOUND })
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('unitId', ParseIntPipe) unitId: number,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<void> {
    await this.departmentService.remove(unitId, id);
  }
}
