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
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Paginated, PaginatedResult } from '../common/dto/paginated.dto';
import { UserTypeService } from './user-type.service';
import { CreateUserTypeDto } from './dto/create-user-type.dto';
import { UpdateUserTypeDto } from './dto/update-user-type.dto';
import { UserTypeResponseDto } from './dto/user-type-response.dto';
import { UserTypeLookupDto } from './dto/user-type-lookup.dto';

@ApiBearerAuth('bearer')
@ApiTags('Tipos de Usuário')
@Controller('user-types')
export class UserTypeController {
  constructor(private readonly userTypeService: UserTypeService) {}

  @ApiOperation({ summary: 'Cria um novo tipo de usuário' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Tipo de usuário criado com sucesso.',
    type: UserTypeResponseDto,
  })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Dados inválidos.' })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Nome já cadastrado.' })
  @Post()
  create(@Body() dto: CreateUserTypeDto): Promise<UserTypeResponseDto> {
    return this.userTypeService.create(dto);
  }

  @ApiOperation({ summary: 'Lista tipos de usuário com paginação' })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'offset', required: false, type: Number, example: 0 })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista paginada retornada com sucesso.',
    type: Paginated(UserTypeResponseDto),
  })
  @Get()
  findAll(
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset: number,
  ): Promise<PaginatedResult<UserTypeResponseDto>> {
    return this.userTypeService.findAll(limit, offset);
  }

  @ApiOperation({ summary: 'Lista tipos ativos para select/dropdown (id e name)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de lookup ordenada por nome.',
    type: [UserTypeLookupDto],
  })
  @Get('lookup')
  getLookup(): Promise<UserTypeLookupDto[]> {
    return this.userTypeService.getLookup();
  }

  @ApiOperation({ summary: 'Obtém um tipo de usuário pelo ID' })
  @ApiParam({ name: 'id', type: Number, description: 'ID do tipo de usuário.' })
  @ApiResponse({ status: HttpStatus.OK, type: UserTypeResponseDto })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Tipo não encontrado.' })
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<UserTypeResponseDto> {
    return this.userTypeService.findOne(id);
  }

  @ApiOperation({ summary: 'Atualiza um tipo de usuário pelo ID' })
  @ApiParam({ name: 'id', type: Number, description: 'ID do tipo de usuário.' })
  @ApiResponse({ status: HttpStatus.OK, type: UserTypeResponseDto })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Tipo não encontrado.' })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Nome já cadastrado.' })
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUserTypeDto,
  ): Promise<UserTypeResponseDto> {
    return this.userTypeService.update(id, dto);
  }

  @ApiOperation({ summary: 'Remove um tipo de usuário pelo ID' })
  @ApiParam({ name: 'id', type: Number, description: 'ID do tipo de usuário.' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Removido com sucesso.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Tipo não encontrado.' })
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.userTypeService.remove(id);
  }
}
