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
import { CreateFundingAgencyDto } from './dto/create-funding-agency.dto';
import { UpdateFundingAgencyDto } from './dto/update-funding-agency.dto';
import { FundingAgencyResponseDto } from './dto/funding-agency-response.dto';
import { FundingAgencyLookupDto } from './dto/funding-agency-lookup.dto';
import { FundingAgencyService } from './funding-agency.service';

@ApiBearerAuth('bearer')
@ApiTags('Órgãos Financiadores')
@Controller('funding-agencies')
export class FundingAgencyController {
  constructor(private readonly fundingAgencyService: FundingAgencyService) {}

  @ApiOperation({ summary: 'Cria um novo órgão financiador' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Órgão financiador criado com sucesso.',
    type: FundingAgencyResponseDto,
  })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Dados inválidos.' })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Nome já cadastrado.' })
  @Post()
  @UseGuards(RolesGuard)
  @Roles('GESTOR')
  create(@Body() createDto: CreateFundingAgencyDto): Promise<FundingAgencyResponseDto> {
    return this.fundingAgencyService.create(createDto);
  }

  @ApiOperation({ summary: 'Lista órgãos financiadores com paginação' })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'offset', required: false, type: Number, example: 0 })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista paginada retornada com sucesso.',
    type: Paginated(FundingAgencyResponseDto),
  })
  @Get()
  findAll(
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset: number,
  ): Promise<PaginatedResult<FundingAgencyResponseDto>> {
    return this.fundingAgencyService.findAll(limit, offset);
  }

  @ApiOperation({ summary: 'Lista órgãos para select/dropdown (id e name)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de lookup ordenada por nome.',
    type: [FundingAgencyLookupDto],
  })
  @Get('lookup')
  getLookup(): Promise<FundingAgencyLookupDto[]> {
    return this.fundingAgencyService.getLookup();
  }

  @ApiOperation({ summary: 'Obtém um órgão financiador pelo ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({
    status: HttpStatus.OK,
    type: FundingAgencyResponseDto,
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Órgão não encontrado.' })
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<FundingAgencyResponseDto> {
    return this.fundingAgencyService.findOne(id);
  }

  @ApiOperation({ summary: 'Atualiza um órgão financiador pelo ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({
    status: HttpStatus.OK,
    type: FundingAgencyResponseDto,
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Órgão não encontrado.' })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Nome já cadastrado.' })
  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('GESTOR')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateFundingAgencyDto,
  ): Promise<FundingAgencyResponseDto> {
    return this.fundingAgencyService.update(id, updateDto);
  }

  @ApiOperation({ summary: 'Remove um órgão financiador pelo ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Órgão removido.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Órgão não encontrado.' })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Órgão associado a tipos de bolsa.',
  })
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(RolesGuard)
  @Roles('GESTOR')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.fundingAgencyService.remove(id);
  }
}
