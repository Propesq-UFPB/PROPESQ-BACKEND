import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  HttpStatus,
  Param,
  ParseIntPipe,
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
import { CreateCertificateDto } from './dto/create-certificate.dto';
import { CertificateResponseDto } from './dto/certificate-response.dto';
import { CertificatesService } from './certificates.service';

@ApiBearerAuth('bearer')
@ApiTags('Certificados')
@Controller('certificates')
export class CertificatesController {
  constructor(private readonly certificatesService: CertificatesService) {}

  @ApiOperation({ summary: 'Emite um certificado' })
  @ApiResponse({ status: HttpStatus.CREATED, type: CertificateResponseDto })
  @Post()
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'GESTOR')
  create(@Body() dto: CreateCertificateDto): Promise<CertificateResponseDto> {
    return this.certificatesService.create(dto);
  }

  @ApiOperation({ summary: 'Lista certificados' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  @ApiResponse({ status: HttpStatus.OK, type: Paginated(CertificateResponseDto) })
  @Get()
  findAll(
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset: number,
  ): Promise<PaginatedResult<CertificateResponseDto>> {
    return this.certificatesService.findAll(limit, offset);
  }

  @ApiOperation({ summary: 'Obtém um certificado pelo ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: HttpStatus.OK, type: CertificateResponseDto })
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<CertificateResponseDto> {
    return this.certificatesService.findOne(id);
  }
}
