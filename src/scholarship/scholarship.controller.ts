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
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Paginated, PaginatedResult } from '../common/dto/paginated.dto';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreateScholarshipDto } from './dto/create-scholarship.dto';
import { CreateScholarshipFromSettingsDto } from './dto/create-scholarship-from-settings.dto';
import { UpdateScholarshipDto } from './dto/update-scholarship.dto';
import { ScholarshipResponseDto } from './dto/scholarship-response.dto';
import { ScholarshipLookupDto } from './dto/scholarship-lookup.dto';
import { ScholarshipService } from './scholarship.service';

@ApiBearerAuth('bearer')
@ApiTags('Bolsas')
@Controller('scholarships')
export class ScholarshipController {
  constructor(private readonly scholarshipService: ScholarshipService) {}

  @ApiOperation({ summary: 'Cria uma nova bolsa' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Bolsa criada com sucesso.',
    type: ScholarshipResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Dados inválidos para criação da bolsa.',
  })
  @Post()
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'GESTOR')
  create(@Body() createDto: CreateScholarshipDto): Promise<ScholarshipResponseDto> {
    return this.scholarshipService.create(createDto);
  }

  @ApiOperation({
    summary: 'Cria uma bolsa a partir da tela de configurações (campos mínimos + defaults)',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Bolsa criada com defaults técnicos.',
    type: ScholarshipResponseDto,
  })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Dados inválidos.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Órgão financiador não encontrado.' })
  @Post('from-settings')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'GESTOR')
  createFromSettings(
    @Body() createDto: CreateScholarshipFromSettingsDto,
  ): Promise<ScholarshipResponseDto> {
    return this.scholarshipService.createFromSettings(createDto);
  }

  @ApiOperation({ summary: 'Lista bolsas com paginação' })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'offset', required: false, type: Number, example: 0 })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista paginada de bolsas retornada com sucesso.',
    type: Paginated(ScholarshipResponseDto),
  })
  @Get()
  findAll(
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset: number,
  ): Promise<PaginatedResult<ScholarshipResponseDto>> {
    return this.scholarshipService.findAll(limit, offset);
  }

  @ApiOperation({ summary: 'Lista bolsas para select/dropdown (id e descrição)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista completa de opções de lookup, ordenada alfabeticamente por descrição.',
    type: [ScholarshipLookupDto],
  })
  @Get('lookup')
  getLookup(): Promise<ScholarshipLookupDto[]> {
    return this.scholarshipService.getLookup();
  }

  @ApiOperation({ summary: 'Obtém uma bolsa pelo ID' })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID da bolsa.',
    example: 1,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Bolsa retornada com sucesso.',
    type: ScholarshipResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Bolsa não encontrada.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Parâmetro de identificação inválido.',
  })
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<ScholarshipResponseDto> {
    return this.scholarshipService.findOne(id);
  }

  @ApiOperation({ summary: 'Atualiza uma bolsa pelo ID' })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID da bolsa.',
    example: 1,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Bolsa atualizada com sucesso.',
    type: ScholarshipResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Bolsa não encontrada.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Dados de atualização inválidos.',
  })
  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'GESTOR')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateScholarshipDto,
  ): Promise<ScholarshipResponseDto> {
    return this.scholarshipService.update(id, updateDto);
  }

  @ApiOperation({ summary: 'Remove uma bolsa pelo ID' })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID da bolsa.',
    example: 1,
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Bolsa removida com sucesso.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Bolsa não encontrada.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Parâmetro de identificação inválido.',
  })
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'GESTOR')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.scholarshipService.remove(id);
  }
}
