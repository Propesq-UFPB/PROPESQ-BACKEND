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
import { CreateProjectMemberDto } from './dto/create-project-member.dto';
import { UpdateProjectMemberDto } from './dto/update-project-member.dto';
import { ProjectMemberResponseDto } from './dto/project-member-response.dto';
import { ProjectMembersService } from './project-members.service';

@ApiBearerAuth('bearer')
@ApiTags('Membros de Projeto')
@Controller('project-members')
export class ProjectMembersController {
  constructor(private readonly projectMembersService: ProjectMembersService) {}

  @ApiOperation({ summary: 'Vincula um membro a um projeto' })
  @ApiResponse({ status: HttpStatus.CREATED, type: ProjectMemberResponseDto })
  @Post()
  @UseGuards(RolesGuard)
  @Roles('GESTOR')
  create(@Body() dto: CreateProjectMemberDto): Promise<ProjectMemberResponseDto> {
    return this.projectMembersService.create(dto);
  }

  @ApiOperation({ summary: 'Lista membros de projeto' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  @ApiQuery({ name: 'projeto_pesquisa_id', required: false, type: Number })
  @ApiResponse({ status: HttpStatus.OK, type: Paginated(ProjectMemberResponseDto) })
  @Get()
  findAll(
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset: number,
    @Query('projeto_pesquisa_id', new ParseIntPipe({ optional: true }))
    projetoPesquisaId?: number,
  ): Promise<PaginatedResult<ProjectMemberResponseDto>> {
    return this.projectMembersService.findAll(limit, offset, projetoPesquisaId);
  }

  @ApiOperation({ summary: 'Obtém um membro pelo ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: HttpStatus.OK, type: ProjectMemberResponseDto })
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<ProjectMemberResponseDto> {
    return this.projectMembersService.findOne(id);
  }

  @ApiOperation({ summary: 'Atualiza um membro de projeto' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: HttpStatus.OK, type: ProjectMemberResponseDto })
  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('GESTOR')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProjectMemberDto,
  ): Promise<ProjectMemberResponseDto> {
    return this.projectMembersService.update(id, dto);
  }

  @ApiOperation({ summary: 'Remove um membro de projeto' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: HttpStatus.NO_CONTENT })
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(RolesGuard)
  @Roles('GESTOR')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.projectMembersService.remove(id);
  }
}
