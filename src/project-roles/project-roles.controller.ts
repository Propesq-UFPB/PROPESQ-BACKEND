import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseBoolPipe,
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
import { CreateProjectRoleDto } from './dto/create-project-role.dto';
import { UpdateProjectRoleDto } from './dto/update-project-role.dto';
import { ProjectRoleResponseDto } from './dto/project-role-response.dto';
import { ProjectRoleLookupDto } from './dto/project-role-lookup.dto';
import { ProjectRolesService } from './project-roles.service';

@ApiBearerAuth('bearer')
@ApiTags('Funções de Projeto')
@Controller('project-roles')
export class ProjectRolesController {
  constructor(private readonly projectRolesService: ProjectRolesService) {}

  @ApiOperation({ summary: 'Cria uma nova função de projeto' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Função de projeto criada com sucesso.',
    type: ProjectRoleResponseDto,
  })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Dados inválidos.' })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Nome já cadastrado.' })
  @Post()
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'GESTOR')
  create(@Body() createDto: CreateProjectRoleDto): Promise<ProjectRoleResponseDto> {
    return this.projectRolesService.create(createDto);
  }

  @ApiOperation({ summary: 'Lista funções de projeto com paginação' })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'offset', required: false, type: Number, example: 0 })
  @ApiQuery({
    name: 'ativo',
    required: false,
    type: Boolean,
    description: 'Filtra por funções ativas ou inativas.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista paginada retornada com sucesso.',
    type: Paginated(ProjectRoleResponseDto),
  })
  @Get()
  findAll(
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset: number,
    @Query('ativo', new ParseBoolPipe({ optional: true })) ativo?: boolean,
  ): Promise<PaginatedResult<ProjectRoleResponseDto>> {
    return this.projectRolesService.findAll(limit, offset, ativo);
  }

  @ApiOperation({ summary: 'Lista funções ativas para select/dropdown (id e name)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de lookup ordenada por nome.',
    type: [ProjectRoleLookupDto],
  })
  @Get('lookup')
  getLookup(): Promise<ProjectRoleLookupDto[]> {
    return this.projectRolesService.getLookup();
  }

  @ApiOperation({ summary: 'Obtém uma função de projeto pelo ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({
    status: HttpStatus.OK,
    type: ProjectRoleResponseDto,
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Função não encontrada.' })
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<ProjectRoleResponseDto> {
    return this.projectRolesService.findOne(id);
  }

  @ApiOperation({ summary: 'Atualiza uma função de projeto pelo ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({
    status: HttpStatus.OK,
    type: ProjectRoleResponseDto,
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Função não encontrada.' })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Nome já cadastrado.' })
  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'GESTOR')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateProjectRoleDto,
  ): Promise<ProjectRoleResponseDto> {
    return this.projectRolesService.update(id, updateDto);
  }

  @ApiOperation({ summary: 'Remove uma função de projeto pelo ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Função removida.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Função não encontrada.' })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Função em uso em projetos.',
  })
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'GESTOR')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.projectRolesService.remove(id);
  }
}
