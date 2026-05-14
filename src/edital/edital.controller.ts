import { Body, Controller, Post } from '@nestjs/common';
import { CreateEditalDto } from './dto/create-edital.dto';
import { ApiBearerAuth, ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import { EditalService } from './edital.service';

@ApiBearerAuth('bearer')
@ApiTags('Edital')
@Controller('edital')
export class EditalController {
  constructor(private readonly editalService: EditalService) {}

  @Post()
  @ApiCreatedResponse({ description: 'Edital cadastrado com sucesso.' })
  async create(@Body() createEditalDto: CreateEditalDto) {
    return this.editalService.create(createEditalDto);
  }
}
