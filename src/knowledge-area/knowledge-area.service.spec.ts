import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { KnowledgeAreaLookupLevel } from './dto/knowledge-area-lookup.dto';
import { KnowledgeAreaService } from './knowledge-area.service';

const mockPrismaService = {
  area_conhecimento: {
    findMany: jest.fn(),
  },
};

describe('KnowledgeAreaService', () => {
  let service: KnowledgeAreaService;
  let prisma: typeof mockPrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [KnowledgeAreaService, { provide: PrismaService, useValue: mockPrismaService }],
    }).compile();

    service = module.get(KnowledgeAreaService);
    prisma = module.get(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('retorna somente grandes áreas quando não há filtros', async () => {
    prisma.area_conhecimento.findMany.mockResolvedValue([
      { id: 1, grande_area: 'Ciências Agrárias' },
    ]);

    const result = await service.getLookup({});

    expect(prisma.area_conhecimento.findMany).toHaveBeenCalledWith({
      where: { area: '', sub_area: '', especialidade: '' },
      select: { id: true, grande_area: true },
      orderBy: { grande_area: 'asc' },
    });
    expect(result).toEqual([
      { id: 1, name: 'Ciências Agrárias', level: KnowledgeAreaLookupLevel.GRANDE_AREA },
    ]);
  });

  it('retorna áreas da grande área selecionada', async () => {
    prisma.area_conhecimento.findMany.mockResolvedValue([{ id: 2, area: 'Agronomia' }]);

    const result = await service.getLookup({ grande_area: 'Ciências Agrárias' });

    expect(prisma.area_conhecimento.findMany).toHaveBeenCalledWith({
      where: {
        grande_area: 'Ciências Agrárias',
        area: { not: '' },
        sub_area: '',
        especialidade: '',
      },
      select: { id: true, area: true },
      orderBy: { area: 'asc' },
    });
    expect(result).toEqual([{ id: 2, name: 'Agronomia', level: KnowledgeAreaLookupLevel.AREA }]);
  });

  it('retorna subáreas da área selecionada', async () => {
    prisma.area_conhecimento.findMany.mockResolvedValue([{ id: 3, sub_area: 'Ciência do Solo' }]);

    const result = await service.getLookup({
      grande_area: 'Ciências Agrárias',
      area: 'Agronomia',
    });

    expect(prisma.area_conhecimento.findMany).toHaveBeenCalledWith({
      where: {
        grande_area: 'Ciências Agrárias',
        area: 'Agronomia',
        sub_area: { not: '' },
        especialidade: '',
      },
      select: { id: true, sub_area: true },
      orderBy: { sub_area: 'asc' },
    });
    expect(result).toEqual([
      { id: 3, name: 'Ciência do Solo', level: KnowledgeAreaLookupLevel.SUB_AREA },
    ]);
  });

  it('retorna especialidades da subárea selecionada', async () => {
    prisma.area_conhecimento.findMany.mockResolvedValue([
      { id: 4, especialidade: 'Fertilidade do Solo e Adubação' },
    ]);

    const result = await service.getLookup({
      grande_area: 'Ciências Agrárias',
      area: 'Agronomia',
      sub_area: 'Ciência do Solo',
    });

    expect(prisma.area_conhecimento.findMany).toHaveBeenCalledWith({
      where: {
        grande_area: 'Ciências Agrárias',
        area: 'Agronomia',
        sub_area: 'Ciência do Solo',
        especialidade: { not: '' },
      },
      select: { id: true, especialidade: true },
      orderBy: { especialidade: 'asc' },
    });
    expect(result).toEqual([
      {
        id: 4,
        name: 'Fertilidade do Solo e Adubação',
        level: KnowledgeAreaLookupLevel.ESPECIALIDADE,
      },
    ]);
  });
});
