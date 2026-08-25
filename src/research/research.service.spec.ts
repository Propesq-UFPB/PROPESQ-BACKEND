import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Prisma, Idioma, SituacaoProjeto, TipoProjeto } from '@prisma/client';
import { ProjectMembershipScopeService } from '../common/project-membership-scope.service';
import { PrismaService } from '../prisma/prisma.service';
import { ResearchService } from './research.service';
import { CreateResearchDto } from './dto/create-research.dto';
import { updateResearchDto } from './dto/update-research.dto';

const mockMembership = {
  buildAllowedPesquisaIds: jest.fn().mockResolvedValue(null),
};

const categoriaPadrao = {
  id: 1,
  denominacao: 'CATEGORIA_PADRAO',
  ordem: 1,
  ativo: true,
};

const corpoProjeto = {
  resumo: 'Resumo',
  abstract: 'Abstract',
  introducao: 'Introdução',
  objetivos: 'Objetivos',
  metodologia: 'Metodologia',
  referencias: 'Referências',
};

const atividadesProjeto = [
  {
    descricao: 'Atividade de pesquisa',
    meses: [{ data: '2026-01-01' }, { data: '2026-02-01' }],
  },
];

const mockPrismaService = {
  projeto_pesquisa: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  historico_avaliacao: {
    create: jest.fn(),
  },
  $transaction: jest.fn(),
  unidade_academica: {
    findUnique: jest.fn(),
  },
  palavra_chave: {
    findMany: jest.fn(),
  },
  objetivo_desenvolvimento_sustentavel: {
    findMany: jest.fn(),
  },
  categoria_edital: {
    findUnique: jest.fn(),
  },
};

describe('ResearchService', () => {
  let service: ResearchService;
  let prisma: typeof mockPrismaService;
  const researchRecord = {
    id: 1,
    tipo: TipoProjeto.INTERNO,
    titulo: 'Projeto em PT',
    title: 'Project in EN',
    categoria: categoriaPadrao,
    codigo: 'RP-001',
    email: 'research@example.com',
    situacao: SituacaoProjeto.SUBMETIDO,
    data_cadastro: new Date('2026-01-01'),
    palavra_chave: [{ lingua: Idioma.PT, palavra_chave: 'pesquisa' }],
    objetivos: [{ objetivo: { id: 10, tipo: 'ODS 10' } }],
    atividades: [{ descricao: 'Atividade', meses: [{ data: new Date('2026-01-10') }] }],
    corpo_projeto: {
      resumo: 'Resumo',
      abstract: 'Abstract',
      introducao: 'Introducao',
      objetivos: 'Objetivos',
      metodologia: 'Metodologia',
      referencias: 'Referencias',
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ResearchService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: ProjectMembershipScopeService,
          useValue: mockMembership,
        },
      ],
    }).compile();

    service = module.get<ResearchService>(ResearchService);
    prisma = module.get(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
    mockMembership.buildAllowedPesquisaIds.mockResolvedValue(null);
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createDto: CreateResearchDto = {
      tipo: TipoProjeto.INTERNO,
      titulo: 'Projeto em PT',
      title: 'Project in EN',
      categoria_id: categoriaPadrao.id,
      vigencia: new Date('2026-01-01') as any,
      data_inicio: new Date('2026-01-02') as any,
      data_fim: new Date('2026-12-31') as any,
      email: 'research@example.com',
      palavras_chave_ids: [1, 2],
      pesquisa_objetivo_ids: [10],
      corpo_projeto: corpoProjeto,
      atividades: atividadesProjeto,
      unidade_id: 3,
      area_conhecimento_id: 1,
    };

    it('deve persistir o projeto de pesquisa com as datas', async () => {
      prisma.unidade_academica.findUnique.mockResolvedValue({ id: 3 });
      prisma.palavra_chave.findMany.mockResolvedValue([{ id: 1 }, { id: 2 }]);
      prisma.objetivo_desenvolvimento_sustentavel.findMany.mockResolvedValue([{ id: 10 }]);
      prisma.categoria_edital.findUnique.mockResolvedValue({ id: 1 });
      prisma.projeto_pesquisa.create.mockResolvedValue({ id: 1 });

      await service.create(createDto);

      expect(prisma.projeto_pesquisa.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            tipo: TipoProjeto.INTERNO,
            codigo: 'DEFAULT_CODE',
            situacao: SituacaoProjeto.SUBMETIDO,
            data_inicio: createDto.data_inicio,
            data_fim: createDto.data_fim,
            categoria: {
              connect: { id: categoriaPadrao.id },
            },
            corpo_projeto: {
              create: corpoProjeto,
            },
            atividades: {
              create: [
                {
                  descricao: 'Atividade de pesquisa',
                  meses: {
                    create: [{ data: '2026-01-01' }, { data: '2026-02-01' }],
                  },
                },
              ],
            },
          }),
          include: expect.objectContaining({ categoria: true }),
        }),
      );
    });

    it('deve lançar erro quando a unidade acadêmica não existir', async () => {
      prisma.unidade_academica.findUnique.mockResolvedValue(null);

      await expect(service.create(createDto)).rejects.toThrow(NotFoundException);
    });

    it('deve lançar erro quando a categoria não existir', async () => {
      prisma.unidade_academica.findUnique.mockResolvedValue({ id: 3 });
      prisma.palavra_chave.findMany.mockResolvedValue([{ id: 1 }, { id: 2 }]);
      prisma.categoria_edital.findUnique.mockResolvedValue(null);

      await expect(service.create(createDto)).rejects.toThrow(
        `Categoria id ${categoriaPadrao.id} não existente`,
      );
      expect(prisma.projeto_pesquisa.create).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('deve retornar lista paginada formatada', async () => {
      prisma.projeto_pesquisa.findMany.mockResolvedValue([
        {
          id: 1,
          tipo: TipoProjeto.INTERNO,
          titulo: 'Projeto em PT',
          title: 'Project in EN',
          categoria: categoriaPadrao,
          codigo: 'RP-001',
          email: 'research@example.com',
          situacao: SituacaoProjeto.SUBMETIDO,
          data_cadastro: new Date('2026-01-01'),
          palavra_chave: [
            { lingua: Idioma.PT, palavra_chave: 'pesquisa' },
            { lingua: Idioma.EN, palavra_chave: 'research' },
          ],
          objetivos: [{ objetivo: { id: 10, tipo: 'ODS 10' } }],
          atividades: [],
        },
      ]);
      prisma.projeto_pesquisa.count.mockResolvedValue(1);

      const result = await service.findAll(10, 0, {
        userId: 1,
        email: 'admin@test.com',
        nome: 'Admin',
        funcao: 'GESTOR',
      });

      expect(result.total).toBe(1);
      expect(result.results[0].codigo).toBe('RP-001');
      expect(result.results[0].key_words).toEqual(['research']);
      expect(result.results[0].palavras_chave).toEqual(['pesquisa']);
      expect(prisma.projeto_pesquisa.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: {} }),
      );
    });

    it('COORDENADOR filtra por ids permitidos', async () => {
      mockMembership.buildAllowedPesquisaIds.mockResolvedValue([5, 8]);
      prisma.projeto_pesquisa.findMany.mockResolvedValue([]);
      prisma.projeto_pesquisa.count.mockResolvedValue(0);

      await service.findAll(10, 0, {
        userId: 10,
        email: 'c@t.com',
        nome: 'Coord',
        funcao: 'COORDENADOR',
      });

      expect(prisma.projeto_pesquisa.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: { in: [5, 8] } },
        }),
      );
      expect(prisma.projeto_pesquisa.count).toHaveBeenCalledWith({
        where: { id: { in: [5, 8] } },
      });
    });
  });

  describe('findOne', () => {
    it('deve retornar um projeto formatado com corpo', async () => {
      prisma.projeto_pesquisa.findUnique.mockResolvedValue({
        id: 1,
        tipo: TipoProjeto.INTERNO,
        titulo: 'Projeto em PT',
        title: 'Project in EN',
        categoria: categoriaPadrao,
        codigo: 'RP-001',
        email: 'research@example.com',
        situacao: SituacaoProjeto.SUBMETIDO,
        data_cadastro: new Date('2026-01-01'),
        palavra_chave: [{ lingua: Idioma.PT, palavra_chave: 'pesquisa' }],
        objetivos: [{ objetivo: { id: 10, tipo: 'ODS 10' } }],
        atividades: [{ descricao: 'Atividade', meses: [{ data: new Date('2026-01-10') }] }],
        corpo_projeto: {
          resumo: 'Resumo',
          abstract: 'Abstract',
          introducao: 'Introducao',
          objetivos: 'Objetivos',
          metodologia: 'Metodologia',
          referencias: 'Referencias',
        },
      });

      const result = await service.findOne(1);

      expect(result.corpo?.resumo).toBe('Resumo');
      expect(result.atividades[0].descricao).toBe('Atividade');
    });

    it('deve lançar NotFoundException quando não existir', async () => {
      prisma.projeto_pesquisa.findUnique.mockResolvedValue(null);

      await expect(service.findOne(123)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    const updateDto: updateResearchDto = {
      titulo: 'Novo título',
      data_inicio: new Date('2026-02-01') as any,
      data_fim: new Date('2026-11-30') as any,
      unidade_id: 3,
      corpo_projeto: {
        metodologia: 'Nova metodologia',
      },
      atividades: atividadesProjeto,
    };

    it('deve atualizar sem sobrescrever codigo e situacao', async () => {
      prisma.projeto_pesquisa.findUnique.mockResolvedValue(researchRecord);
      prisma.unidade_academica.findUnique.mockResolvedValue({ id: 3 });
      prisma.projeto_pesquisa.update.mockResolvedValue({ id: 1 });

      await service.update(1, updateDto);

      const [call] = prisma.projeto_pesquisa.update.mock.calls[0];
      expect(call.data).toMatchObject({
        titulo: 'Novo título',
        data_inicio: updateDto.data_inicio,
        data_fim: updateDto.data_fim,
        corpo_projeto: {
          update: {
            metodologia: 'Nova metodologia',
          },
        },
        atividades: {
          deleteMany: {},
          create: [
            {
              descricao: 'Atividade de pesquisa',
              meses: {
                create: [{ data: '2026-01-01' }, { data: '2026-02-01' }],
              },
            },
          ],
        },
      });
      expect(call.data).not.toHaveProperty('codigo');
      expect(call.data).not.toHaveProperty('situacao');
    });
  });

  describe('delete', () => {
    it('deve remover um projeto existente', async () => {
      prisma.projeto_pesquisa.findUnique.mockResolvedValue({ id: 1 });
      prisma.projeto_pesquisa.delete.mockResolvedValue({ id: 1 });

      const result = await service.delete(1);

      expect(prisma.projeto_pesquisa.delete).toHaveBeenCalledWith({
        where: { id: 1 },
        include: {
          anexo_projeto_pesquisa: true,
          objetivos: true,
          palavra_chave: true,
          corpo_projeto: true,
        },
      });
      expect(result).toEqual({ id: 1 });
    });
  });

  describe('publish', () => {
    it('deve publicar quando estado atual for permitido', async () => {
      prisma.projeto_pesquisa.findUnique.mockResolvedValue({
        id: 1,
        situacao: SituacaoProjeto.VALIDADO,
        unidade_id: 3,
      });
      prisma.projeto_pesquisa.update.mockResolvedValue({ id: 1 });

      await service.publish(1, {
        userId: 1,
        email: 'coord@teste.com',
        nome: 'Coordenador',
        funcao: 'COORDENADOR',
        unidade_id: 3,
      });

      expect(prisma.projeto_pesquisa.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          situacao: SituacaoProjeto.PUBLICADO,
        },
      });
    });

    it('deve lançar erro quando usuário não for coordenador', async () => {
      prisma.projeto_pesquisa.findUnique.mockResolvedValue({
        id: 1,
        situacao: SituacaoProjeto.VALIDADO,
        unidade_id: 3,
      });

      await expect(
        service.publish(1, {
          userId: 1,
          email: 'user@teste.com',
          nome: 'Usuário',
          funcao: 'ALUNO',
        }),
      ).rejects.toThrow();
    });
  });

  describe('finalDecision', () => {
    it('deve atualizar a situacao e registrar o historico final', async () => {
      const mockTx = {
        projeto_pesquisa: {
          update: jest.fn(),
        },
        historico_avaliacao: {
          create: jest.fn(),
        },
      };

      prisma.projeto_pesquisa.findUnique.mockResolvedValue({ id: 1 });
      prisma.$transaction.mockImplementation(async callback => callback(mockTx as any));

      await service.finalDecision(1, 10, {
        situacao: SituacaoProjeto.APROVADO,
        justificativa: 'Projeto aprovado com observacoes finais',
        pontuacao_final: 9.5,
      });

      expect(prisma.$transaction).toHaveBeenCalled();
      expect(mockTx.projeto_pesquisa.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          situacao: SituacaoProjeto.APROVADO,
          pontuacao_final: 9.5,
        },
      });
      expect(mockTx.historico_avaliacao.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            projeto_id: 1,
            avaliador_id: 10,
            status: SituacaoProjeto.APROVADO,
            observacao: 'Projeto aprovado com observacoes finais',
          }),
        }),
      );
    });

    it('deve lançar NotFoundException quando o projeto nao existir', async () => {
      prisma.projeto_pesquisa.findUnique.mockResolvedValue(null);

      await expect(
        service.finalDecision(999, 10, {
          situacao: SituacaoProjeto.REPROVADO,
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getRanking', () => {
    it('deve retornar apenas projetos aprovados ordenados corretamente', async () => {
      prisma.projeto_pesquisa.findMany.mockResolvedValue([
        {
          id: 1,
          tipo: TipoProjeto.INTERNO,
          titulo: 'Projeto A',
          title: 'Project A',
          categoria: categoriaPadrao,
          codigo: 'RP-001',
          email: 'research@example.com',
          situacao: SituacaoProjeto.APROVADO,
          data_cadastro: new Date('2026-01-01'),
          palavra_chave: [{ lingua: Idioma.PT, palavra_chave: 'pesquisa' }],
          objetivos: [],
          atividades: [],
        },
      ]);
      prisma.projeto_pesquisa.count.mockResolvedValue(1);

      const result = await service.getRanking(10, 0);

      expect(prisma.projeto_pesquisa.findMany).toHaveBeenCalledWith({
        where: { situacao: SituacaoProjeto.APROVADO },
        include: {
          corpo_projeto: true,
          palavra_chave: true,
          objetivos: true,
          categoria: true,
        },
        take: 10,
        skip: 0,
        orderBy: [{ pontuacao_final: 'desc' }, { data_cadastro: 'asc' }],
      });

      expect(result.total).toBe(1);
      expect(result.results).toHaveLength(1);
      expect(result.results[0].codigo).toBe('RP-001');
    });

    it('deve retornar vazio quando nao houver projetos aprovados', async () => {
      prisma.projeto_pesquisa.findMany.mockResolvedValue([]);
      prisma.projeto_pesquisa.count.mockResolvedValue(0);

      const result = await service.getRanking(10, 0);

      expect(result.total).toBe(0);
      expect(result.results).toHaveLength(0);
    });
  });
});
