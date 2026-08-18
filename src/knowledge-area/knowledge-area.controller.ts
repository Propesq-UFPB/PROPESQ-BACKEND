import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { KnowledgeAreaLookupDto } from './dto/knowledge-area-lookup.dto';
import { KnowledgeAreaLookupQueryDto } from './dto/knowledge-area-lookup-query.dto';
import { KnowledgeAreaService } from './knowledge-area.service';

@ApiBearerAuth('bearer')
@ApiTags('Áreas de Conhecimento')
@Controller('knowledge-areas')
export class KnowledgeAreaController {
  constructor(private readonly knowledgeAreaService: KnowledgeAreaService) {}

  @ApiOperation({
    summary: 'Lista o próximo nível da tabela hierárquica de áreas de conhecimento',
  })
  @ApiOkResponse({
    description: 'Opções do próximo nível hierárquico retornadas em ordem alfabética.',
    type: [KnowledgeAreaLookupDto],
  })
  @Get('lookup')
  getLookup(@Query() query: KnowledgeAreaLookupQueryDto): Promise<KnowledgeAreaLookupDto[]> {
    return this.knowledgeAreaService.getLookup(query);
  }
}
