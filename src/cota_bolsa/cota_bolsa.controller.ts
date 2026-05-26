import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  Query,
  Param,
  UseGuards,
} from '@nestjs/common';
import { CotaBolsaService } from './cota_bolsa.service';
import { CreateCotaBolsaDto } from './dto/create-cota-bolsa.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import {
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { RolesGuard } from '../auth/roles.guard';
import { UpdateCotaBolsaDto } from './dto/update-cota-bolsa.dto';

@Controller('cota-bolsa')
export class CotaBolsaController {
  constructor(private readonly cotaBolsaService: CotaBolsaService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles('GESTOR')
  @ApiCreatedResponse({ description: 'Cota bolsa cadastrada com sucesso.' })
  async create(@Body() createCotaBolsaDto: CreateCotaBolsaDto) {
    return this.cotaBolsaService.create(createCotaBolsaDto);
  }

  @Get(':id')
  @ApiOkResponse({ description: 'Cota bolsa retornada com sucesso' })
  @ApiNotFoundResponse({ description: 'Cota bolsa não encontrada' })
  async findOne(@Param('id') id: number) {
    return this.cotaBolsaService.findOne(id);
  }

  @Get()
  @ApiOkResponse({ description: 'Cotas bolsa retornadas com sucesso' })
  @ApiQuery({ name: 'limit', required: false, type: Number, default: 10 })
  @ApiQuery({ name: 'offset', required: false, type: Number, default: 0 })
  async findMany(@Query('limit') limit: string, @Query('offset') offset: string) {
    return this.cotaBolsaService.findMany(+limit, +offset);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('GESTOR')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse({ description: 'Cota bolsa deletada com sucesso' })
  @ApiNotFoundResponse({ description: 'Cota bolsa não encontrada' })
  async delete(@Param('id') id: number) {
    return this.cotaBolsaService.delete(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('GESTOR')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse({ description: 'Cota bolsa atualizada com sucesso' })
  @ApiNotFoundResponse({ description: 'Cota bolsa não encontrada' })
  async update(@Param('id') id: number, @Body() updateCotaBolsaDto: UpdateCotaBolsaDto) {
    return this.cotaBolsaService.update(id, updateCotaBolsaDto);
  }
}
