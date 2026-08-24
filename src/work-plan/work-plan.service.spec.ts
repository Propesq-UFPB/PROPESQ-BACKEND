import { BadRequestException, ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TipoIndicacao } from '@prisma/client';
import { CurrentUserPayload } from '../auth/decorators/current-user.decorator';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWorkPlanDto } from './dto/create-work-plan.dto';
import { UpdateWorkPlanDto } from './dto/update-work-plan.dto';
import { WorkPlanAccessService } from './work-plan-access.service';
import { WorkPlanService } from './work-plan.service';

const mockAccessService = {
  buildScopeWhere: jest.fn().mockResolvedValue(undefined),
  buildElegibilidadeWhere: jest.fn().mockReturnValue({
    projeto_pesquisa: {
      edital_id: { not: null },
      situacao: { in: ['APROVADO', 'PUBLICADO', 'EM_EXECUCAO', 'CADASTRADO'] },
    },
  }),
  assertCanAccessPlan: jest.fn().mockResolvedValue(undefined),
  assertCanAccessPesquisa: jest.fn().mockResolvedValue(undefined),
  isGestor: jest.fn().mockReturnValue(true),
  isCoordenador: jest.fn().mockReturnValue(false),
};

const mockPrismaService = {
  $transaction: jest.fn(),
  $queryRawUnsafe: jest.fn(),
  $executeRawUnsafe: jest.fn(),
  discente: {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
  },
  usuario: {
    findUnique: jest.fn(),
  },
  cronograma: {
    findUnique: jest.fn(),
  },
  projeto_pesquisa: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  plano_trabalho: {
    create: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  interesse_plano_trabalho: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
  },
  dados_bancarios_indicacao: {
    upsert: jest.fn(),
    deleteMany: jest.fn(),
  },
  atividade_plano_trabalho: {
    findMany: jest.fn(),
    deleteMany: jest.fn(),
    update: jest.fn(),
    create: jest.fn(),
  },
  mes_plano_trabalho: {
    findMany: jest.fn(),
    deleteMany: jest.fn(),
    update: jest.fn(),
    create: jest.fn(),
  },
  corpo_plano_trabalho: {
    findUnique: jest.fn(),
    update: jest.fn(),
    create: jest.fn(),
  },
};

const adminUser: CurrentUserPayload = {
  userId: 1,
  email: 'admin@test.com',
  nome: 'Admin',
  funcao: 'GESTOR',
};

const coordUser: CurrentUserPayload = {
  userId: 2,
  email: 'coord@test.com',
  nome: 'Coord',
  funcao: 'COORDENADOR',
};

const alunoUser: CurrentUserPayload = {
  userId: 3,
  email: 'aluno@test.com',
  nome: 'Aluno',
  funcao: 'ALUNO',
};

const defaultInclude = {
  corpo_plano_trabalho: true,
  discente: true,
  usuario: true,
  projeto_pesquisa: {
    include: {
      edital_rel: {
        include: {
          periodo_execucao_rel: true,
        },
      },
      area_conhecimento: true,
    },
  },
};

describe('WorkPlanService', () => {
  let service: WorkPlanService;
  let prisma: typeof mockPrismaService;

  beforeEach(async () => {
    mockPrismaService.$transaction.mockImplementation(async callback =>
      callback(mockPrismaService),
    );

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkPlanService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: WorkPlanAccessService, useValue: mockAccessService },
      ],
    }).compile();

    service = module.get<WorkPlanService>(WorkPlanService);
    prisma = module.get(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
    mockAccessService.buildScopeWhere.mockResolvedValue(undefined);
    mockAccessService.assertCanAccessPlan.mockResolvedValue(undefined);
    mockAccessService.assertCanAccessPesquisa.mockResolvedValue(undefined);
    mockAccessService.isGestor.mockReturnValue(true);
    mockAccessService.isCoordenador.mockReturnValue(false);
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createDto: CreateWorkPlanDto = {
      pesquisa_id: 1,
      modalidade: 'PIBIC',
      status: 'ATIVO',
      tipo_bolsa: 'REMUNERADA',
      direcionamento_plano: 'Direcionamento',
      corpo_plano_trabalho: {
        titulo: 'Titulo',
        introducao: 'Introducao',
        objetivos: 'Objetivos',
        metodologia: 'Metodologia',
        referencias: 'Referencias',
      },
      atividades: [
        {
          descricao: 'Atividade 1',
          meses: [{ data: '2026-03-01' }],
        },
      ],
    };

    it('deve criar plano de trabalho com sucesso sem cronograma_id', async () => {
      prisma.projeto_pesquisa.findUnique.mockResolvedValue({ id: 1 });
      prisma.corpo_plano_trabalho.create.mockResolvedValue({ id: 99 });
      prisma.plano_trabalho.create.mockResolvedValue({ id: 1 });
      prisma.plano_trabalho.findUnique.mockResolvedValue({ id: 1 });
      prisma.plano_trabalho.update.mockResolvedValue({ id: 1 });
      prisma.$queryRawUnsafe.mockResolvedValue([]);

      const result = await service.create({ ...createDto, atividades: [] }, adminUser);

      expect(mockAccessService.assertCanAccessPesquisa).toHaveBeenCalledWith(adminUser, 1, {
        forceMemberScope: true,
      });
      expect(prisma.plano_trabalho.create).toHaveBeenCalledWith({
        data: {
          pesquisa_id: 1,
          modalidade: 'PIBIC',
          status: 'ATIVO',
          tipo_bolsa: 'REMUNERADA',
          direcionamento_plano: 'Direcionamento',
          usuario_id: adminUser.userId,
        },
        include: defaultInclude,
      });
      expect(result.id).toEqual(1);
    });

    it('deve lançar erro quando projeto não existe', async () => {
      prisma.projeto_pesquisa.findUnique.mockResolvedValue(null);

      await expect(service.create(createDto, adminUser)).rejects.toThrow(NotFoundException);
      expect(prisma.plano_trabalho.create).not.toHaveBeenCalled();
    });

    it('deve propagar 403 quando sem membership', async () => {
      prisma.projeto_pesquisa.findUnique.mockResolvedValue({ id: 1 });
      mockAccessService.assertCanAccessPesquisa.mockRejectedValueOnce(
        new ForbiddenException('sem acesso'),
      );

      await expect(
        service.create(createDto, {
          userId: 10,
          email: 'c@t.com',
          nome: 'C',
          funcao: 'COORDENADOR',
        }),
      ).rejects.toBeInstanceOf(ForbiddenException);
      expect(prisma.plano_trabalho.create).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('deve retornar resultados paginados com filtros', async () => {
      prisma.plano_trabalho.findMany.mockResolvedValue([{ id: 1 }]);
      prisma.plano_trabalho.count.mockResolvedValue(1);
      prisma.$queryRawUnsafe.mockResolvedValue([]);

      const result = await service.findAll(
        { limit: 10, offset: 0, pesquisa_id: 5, status_indicacao: 'PENDENTE_INDICACAO' as any },
        adminUser,
      );

      expect(prisma.plano_trabalho.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            pesquisa_id: 5,
            status_indicacao: 'PENDENTE_INDICACAO',
          }),
          include: defaultInclude,
        }),
      );
      expect(result).toEqual({
        total: 1,
        limit: 10,
        offset: 0,
        results: [{ id: 1, atividades: [] }],
      });
    });

    it('deve aplicar escopo quando COORDENADOR', async () => {
      mockAccessService.buildScopeWhere.mockResolvedValue({
        pesquisa_id: { in: [10] },
      });
      prisma.plano_trabalho.findMany.mockResolvedValue([]);
      prisma.plano_trabalho.count.mockResolvedValue(0);
      prisma.$queryRawUnsafe.mockResolvedValue([]);

      await service.findAll(
        { limit: 10, offset: 0 },
        { userId: 10, email: 'c@t.com', nome: 'C', funcao: 'COORDENADOR' },
      );

      expect(prisma.plano_trabalho.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            pesquisa_id: { in: [10] },
          }),
        }),
      );
    });
  });

  describe('findOne', () => {
    it('deve retornar o plano quando existir', async () => {
      prisma.plano_trabalho.findUnique.mockResolvedValue({ id: 1 });
      prisma.$queryRawUnsafe.mockResolvedValue([]);

      const result = await service.findOne(1);

      expect(result).toEqual({ id: 1, atividades: [] });
    });

    it('deve lançar NotFoundException quando não existir', async () => {
      prisma.plano_trabalho.findUnique.mockResolvedValue(null);

      await expect(service.findOne(123)).rejects.toThrow(NotFoundException);
    });

    it('COORDENADOR: assert com forceMemberScope', async () => {
      mockAccessService.isCoordenador.mockReturnValue(true);
      prisma.plano_trabalho.findUnique.mockResolvedValue({ id: 1, cronograma_id: null });
      prisma.$queryRawUnsafe.mockResolvedValue([]);

      await service.findOne(1, coordUser);

      expect(mockAccessService.assertCanAccessPlan).toHaveBeenCalledWith(coordUser, 1, {
        forceMemberScope: true,
      });
    });

    it('COORDENADOR sem membership → 403', async () => {
      mockAccessService.isCoordenador.mockReturnValue(true);
      mockAccessService.assertCanAccessPlan.mockRejectedValue(
        new ForbiddenException('Sem permissão'),
      );

      await expect(service.findOne(1, coordUser)).rejects.toBeInstanceOf(ForbiddenException);
      expect(prisma.plano_trabalho.findUnique).not.toHaveBeenCalled();
    });

    it('GESTOR: assert sem forceMemberScope', async () => {
      mockAccessService.isCoordenador.mockReturnValue(false);
      prisma.plano_trabalho.findUnique.mockResolvedValue({ id: 1 });
      prisma.$queryRawUnsafe.mockResolvedValue([]);

      await service.findOne(1, adminUser);

      expect(mockAccessService.assertCanAccessPlan).toHaveBeenCalledWith(
        adminUser,
        1,
        undefined,
      );
    });

    it('ALUNO: assert sem forceMemberScope (lê livre)', async () => {
      mockAccessService.isCoordenador.mockReturnValue(false);
      prisma.plano_trabalho.findUnique.mockResolvedValue({ id: 1 });
      prisma.$queryRawUnsafe.mockResolvedValue([]);

      await service.findOne(1, alunoUser);

      expect(mockAccessService.assertCanAccessPlan).toHaveBeenCalledWith(
        alunoUser,
        1,
        undefined,
      );
    });

    it('plano novo com cronograma_id null', async () => {
      prisma.plano_trabalho.findUnique.mockResolvedValue({
        id: 5,
        cronograma_id: null,
        atividades: undefined,
      });
      prisma.$queryRawUnsafe.mockResolvedValue([]);

      const result = await service.findOne(5, adminUser);

      expect(result).toMatchObject({ id: 5, cronograma_id: null, atividades: [] });
    });
  });

  describe('findIndicacoes', () => {
    it('deve retornar lista vazia mapeada', async () => {
      prisma.plano_trabalho.findMany.mockResolvedValue([]);
      prisma.plano_trabalho.count.mockResolvedValue(0);

      const result = await service.findIndicacoes({ limit: 10, offset: 0 }, adminUser);

      expect(result).toEqual({
        total: 0,
        limit: 10,
        offset: 0,
        results: [],
      });
      expect(mockAccessService.buildScopeWhere).toHaveBeenCalledWith(adminUser, {
        forceMemberScope: true,
      });
    });

    it('deve mapear item com edital, candidatos e status', async () => {
      prisma.plano_trabalho.findMany.mockResolvedValue([
        {
          id: 1,
          pesquisa_id: 10,
          modalidade: 'Bolsista',
          vagas: 1,
          carga_horaria: 20,
          status_indicacao: 'PENDENTE_INDICACAO',
          prazo_indicacao: new Date('2026-10-01'),
          prazo_substituicao: null,
          status_termo_compromisso: 'NAO_ENVIADO',
          tipo_indicacao: null,
          discente_id: null,
          discente: null,
          dados_bancarios: null,
          corpo_plano_trabalho: { titulo: 'Plano X' },
          interesses: [
            {
              id: 7,
              discente_id: 3,
              status: 'APTO_PARA_INDICACAO',
              criado_em: new Date('2026-05-12T00:00:00.000Z'),
              discente: {
                id: 3,
                usuario_id: 30,
                matricula: '2023001',
                lattes_url: null,
                perfil: { curso: 'Computação' },
                usuario: { nome: 'Ana', email: 'ana@test.com' },
              },
            },
          ],
          projeto_pesquisa: {
            titulo: 'Projeto Y',
            data_inicio: new Date('2026-09-01'),
            data_fim: new Date('2027-08-31'),
            area_conhecimento: { area: 'Computação' },
            edital_rel: {
              id: 2,
              codigo: 'PIBIC-2026',
              descricao: 'PIBIC 2026',
              periodo_execucao_rel: {
                inicio: new Date('2026-09-01'),
                fim: new Date('2027-08-31'),
              },
            },
          },
        },
      ]);
      prisma.plano_trabalho.count.mockResolvedValue(1);

      const result = await service.findIndicacoes(
        { limit: 10, offset: 0, status_indicacao: 'PENDENTE_INDICACAO' as any },
        adminUser,
      );

      expect(result.total).toBe(1);
      expect(result.results[0]).toMatchObject({
        id: 1,
        pesquisa_id: 10,
        projeto_titulo: 'Projeto Y',
        plano_titulo: 'Plano X',
        edital: { id: 2, codigo: 'PIBIC-2026', descricao: 'PIBIC 2026' },
        area: 'Computação',
        status_indicacao: 'PENDENTE_INDICACAO',
        total_candidatos: 1,
        candidatos: [
          expect.objectContaining({
            id: 7,
            nome: 'Ana',
            email: 'ana@test.com',
            status_interesse: 'APTO_PARA_INDICACAO',
          }),
        ],
      });
    });
  });

  describe('findIndicacaoById', () => {
    it('deve assertar acesso e retornar item com perfil enriquecido', async () => {
      prisma.plano_trabalho.findUnique.mockResolvedValue({
        id: 1,
        pesquisa_id: 10,
        modalidade: 'Voluntário',
        vagas: 1,
        carga_horaria: null,
        status_indicacao: 'PENDENTE_INDICACAO',
        prazo_indicacao: null,
        prazo_substituicao: null,
        status_termo_compromisso: null,
        tipo_indicacao: null,
        discente_id: null,
        discente: null,
        dados_bancarios: null,
        corpo_plano_trabalho: null,
        interesses: [
          {
            id: 7,
            discente_id: 3,
            status: 'APTO_PARA_INDICACAO',
            criado_em: new Date('2026-05-12T00:00:00.000Z'),
            discente: {
              id: 3,
              usuario_id: 30,
              matricula: '2023001',
              lattes_url: 'https://lattes.cnpq.br/1',
              perfil: {
                curso: 'Computação',
                campus: 'JP',
                periodo: '5º',
                semestre: '2026.1',
                cra: 8.7,
                creditos_concluidos: 112,
                reprovacoes: 0,
                situacao_academica: 'Regular',
                situacao_matricula: 'Ativo',
                cpf: '000',
                rg: null,
                rg_emissao: null,
                orgao_emissor: null,
                titulo_eleitor: null,
                zona_eleitoral: null,
                secao_eleitoral: null,
                certificado_militar: null,
                categoria_militar: null,
                cep: '58000',
                tipo_logradouro: 'Rua',
                logradouro: 'Exemplo',
                numero: '1',
                complemento: null,
                bairro: 'Centro',
                uf: 'PB',
                cidade: 'JP',
                pais: 'Brasil',
                telefone_ddd: '83',
                telefone: null,
                celular_ddd: '83',
                celular: '90000',
                data_nascimento: null,
                sexo: 'F',
                raca: null,
                estado_civil: null,
                nacionalidade: null,
                naturalidade: null,
                tipo_sanguineo: null,
                nome_pai: null,
                nome_mae: null,
                possui_necessidade: false,
                tipo_necessidade: null,
              },
              usuario: { nome: 'Ana', email: 'ana@test.com' },
            },
          },
        ],
        projeto_pesquisa: {
          titulo: 'Projeto',
          data_inicio: null,
          data_fim: null,
          area_conhecimento: null,
          edital_rel: null,
        },
      });

      const result = await service.findIndicacaoById(1, adminUser);

      expect(mockAccessService.assertCanAccessPlan).toHaveBeenCalledWith(adminUser, 1, {
        forceMemberScope: true,
      });
      expect(result.id).toBe(1);
      expect(result.candidatos[0]).toMatchObject({
        id: 7,
        matricula: '2023001',
        lattes_url: 'https://lattes.cnpq.br/1',
        academico: expect.objectContaining({ curso: 'Computação', cra: '8.7' }),
        documentos: expect.objectContaining({ cpf: '000' }),
      });
    });
  });

  describe('confirmIndicacao', () => {
    const detalheAposIndicacao = {
      id: 1,
      pesquisa_id: 10,
      modalidade: 'Bolsista',
      vagas: 1,
      carga_horaria: 20,
      status_indicacao: 'AGUARDANDO_VALIDACAO',
      prazo_indicacao: null,
      prazo_substituicao: null,
      status_termo_compromisso: 'NAO_ENVIADO',
      tipo_indicacao: 'BOLSISTA',
      discente_id: 3,
      discente: {
        id: 3,
        usuario_id: 30,
        matricula: null,
        lattes_url: null,
        perfil: null,
        usuario: { nome: 'Ana', email: 'ana@test.com' },
      },
      dados_bancarios: { banco: 'BB', agencia: '1', conta: '2' },
      corpo_plano_trabalho: null,
      interesses: [
        {
          id: 7,
          discente_id: 3,
          status: 'APTO_PARA_INDICACAO',
          criado_em: new Date(),
          discente: {
            id: 3,
            usuario_id: 30,
            matricula: null,
            lattes_url: null,
            perfil: null,
            usuario: { nome: 'Ana', email: 'ana@test.com' },
          },
        },
      ],
      projeto_pesquisa: {
        titulo: 'Projeto',
        data_inicio: null,
        data_fim: null,
        area_conhecimento: null,
        edital_rel: null,
      },
    };

    it('BOLSISTA com banco confirma e vai para AGUARDANDO_VALIDACAO', async () => {
      prisma.plano_trabalho.findUnique
        .mockResolvedValueOnce({
          id: 1,
          modalidade: 'Bolsista',
          status_indicacao: 'PENDENTE_INDICACAO',
          prazo_indicacao: null,
          dados_bancarios: null,
        })
        .mockResolvedValueOnce(detalheAposIndicacao);
      prisma.interesse_plano_trabalho.findUnique.mockResolvedValue({
        id: 7,
        plano_trabalho_id: 1,
        discente_id: 3,
        status: 'APTO_PARA_INDICACAO',
      });
      prisma.plano_trabalho.update.mockResolvedValue({});
      prisma.dados_bancarios_indicacao.upsert.mockResolvedValue({});

      const result = await service.confirmIndicacao(
        1,
        {
          interesse_id: 7,
          tipo_indicacao: TipoIndicacao.BOLSISTA,
          dados_bancarios: { banco: 'BB', agencia: '1', conta: '2' },
        },
        adminUser,
      );

      expect(prisma.dados_bancarios_indicacao.upsert).toHaveBeenCalled();
      expect(result.status_indicacao).toBe('AGUARDANDO_VALIDACAO');
    });

    it('VOLUNTARIO remove banco', async () => {
      prisma.plano_trabalho.findUnique
        .mockResolvedValueOnce({
          id: 1,
          modalidade: 'Voluntário',
          status_indicacao: 'PENDENTE_INDICACAO',
          prazo_indicacao: null,
          dados_bancarios: { id: 1 },
        })
        .mockResolvedValueOnce({
          ...detalheAposIndicacao,
          modalidade: 'Voluntário',
          tipo_indicacao: 'VOLUNTARIO',
          dados_bancarios: null,
        });
      prisma.interesse_plano_trabalho.findUnique.mockResolvedValue({
        id: 7,
        plano_trabalho_id: 1,
        discente_id: 3,
        status: 'APTO_PARA_INDICACAO',
      });
      prisma.plano_trabalho.update.mockResolvedValue({});
      prisma.dados_bancarios_indicacao.deleteMany.mockResolvedValue({ count: 1 });

      await service.confirmIndicacao(
        1,
        { interesse_id: 7, tipo_indicacao: TipoIndicacao.VOLUNTARIO },
        adminUser,
      );

      expect(prisma.dados_bancarios_indicacao.deleteMany).toHaveBeenCalledWith({
        where: { plano_trabalho_id: 1 },
      });
      expect(prisma.dados_bancarios_indicacao.upsert).not.toHaveBeenCalled();
    });

    it('rejeita se interesse não está APTO', async () => {
      prisma.plano_trabalho.findUnique.mockResolvedValue({
        id: 1,
        modalidade: 'Bolsista',
        status_indicacao: 'PENDENTE_INDICACAO',
        prazo_indicacao: null,
        dados_bancarios: null,
      });
      prisma.interesse_plano_trabalho.findUnique.mockResolvedValue({
        id: 7,
        plano_trabalho_id: 1,
        discente_id: 3,
        status: 'DOCUMENTACAO_PENDENTE',
      });

      await expect(
        service.confirmIndicacao(
          1,
          {
            interesse_id: 7,
            tipo_indicacao: TipoIndicacao.BOLSISTA,
            dados_bancarios: { banco: 'BB', agencia: '1', conta: '2' },
          },
          adminUser,
        ),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('rejeita se prazo vencido', async () => {
      prisma.plano_trabalho.findUnique.mockResolvedValue({
        id: 1,
        modalidade: 'Bolsista',
        status_indicacao: 'PENDENTE_INDICACAO',
        prazo_indicacao: new Date('2020-01-01'),
        dados_bancarios: null,
      });

      await expect(
        service.confirmIndicacao(
          1,
          {
            interesse_id: 7,
            tipo_indicacao: TipoIndicacao.BOLSISTA,
            dados_bancarios: { banco: 'BB', agencia: '1', conta: '2' },
          },
          adminUser,
        ),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('409 se status não permite indicação', async () => {
      prisma.plano_trabalho.findUnique.mockResolvedValue({
        id: 1,
        modalidade: 'Bolsista',
        status_indicacao: 'AGUARDANDO_VALIDACAO',
        prazo_indicacao: null,
        dados_bancarios: null,
      });

      await expect(
        service.confirmIndicacao(
          1,
          {
            interesse_id: 7,
            tipo_indicacao: TipoIndicacao.BOLSISTA,
            dados_bancarios: { banco: 'BB', agencia: '1', conta: '2' },
          },
          adminUser,
        ),
      ).rejects.toBeInstanceOf(ConflictException);
    });

    it('400 se BOLSISTA sem banco', async () => {
      prisma.plano_trabalho.findUnique.mockResolvedValue({
        id: 1,
        modalidade: 'Bolsista',
        status_indicacao: 'PENDENTE_INDICACAO',
        prazo_indicacao: null,
        dados_bancarios: null,
      });
      prisma.interesse_plano_trabalho.findUnique.mockResolvedValue({
        id: 7,
        plano_trabalho_id: 1,
        discente_id: 3,
        status: 'APTO_PARA_INDICACAO',
      });

      await expect(
        service.confirmIndicacao(
          1,
          { interesse_id: 7, tipo_indicacao: TipoIndicacao.BOLSISTA },
          adminUser,
        ),
      ).rejects.toBeInstanceOf(BadRequestException);
    });
  });

  describe('createInteresse', () => {
    it('GESTOR cria interesse com discente_id', async () => {
      prisma.plano_trabalho.findUnique.mockResolvedValue({ id: 1 });
      prisma.discente.findUnique.mockResolvedValue({ id: 3 });
      prisma.interesse_plano_trabalho.findUnique.mockResolvedValue(null);
      prisma.interesse_plano_trabalho.create.mockResolvedValue({
        id: 9,
        plano_trabalho_id: 1,
        discente_id: 3,
        status: 'INTERESSE_REGISTRADO',
        criado_em: new Date('2026-05-01T00:00:00.000Z'),
      });

      const result = await service.createInteresse(1, { discente_id: 3 }, adminUser);

      expect(result).toMatchObject({
        id: 9,
        plano_trabalho_id: 1,
        discente_id: 3,
        status: 'INTERESSE_REGISTRADO',
      });
    });

    it('409 se interesse duplicado', async () => {
      prisma.plano_trabalho.findUnique.mockResolvedValue({ id: 1 });
      prisma.discente.findUnique.mockResolvedValue({ id: 3 });
      prisma.interesse_plano_trabalho.findUnique.mockResolvedValue({ id: 9 });

      await expect(
        service.createInteresse(1, { discente_id: 3 }, adminUser),
      ).rejects.toBeInstanceOf(ConflictException);
    });
  });

  describe('update', () => {
    const updateDto: UpdateWorkPlanDto = {
      status: 'EM_REVISAO',
      atividades: [],
    };

    it('deve atualizar com sucesso', async () => {
      prisma.plano_trabalho.findUnique.mockResolvedValue({
        id: 1,
        discente_id: 1,
        usuario_id: 1,
        pesquisa_id: 1,
        cronograma_id: 7,
        corpo_id: 99,
        projeto_pesquisa: { id: 1 },
      });
      prisma.plano_trabalho.update.mockResolvedValue({ id: 1 });
      prisma.$queryRawUnsafe.mockResolvedValue([]);
      prisma.$executeRawUnsafe.mockResolvedValue(0);

      const result = await service.update(1, updateDto);

      expect(prisma.$transaction).toHaveBeenCalled();
      expect(result.id).toEqual(1);
    });
  });

  describe('remove', () => {
    it('deve remover com sucesso', async () => {
      prisma.plano_trabalho.findUnique.mockResolvedValue({ id: 1 });
      prisma.$queryRawUnsafe.mockResolvedValue([]);
      prisma.plano_trabalho.delete.mockResolvedValue({ id: 1 });

      const result = await service.remove(1);

      expect(prisma.plano_trabalho.delete).toHaveBeenCalledWith({
        where: { id: 1 },
        include: defaultInclude,
      });
      expect(result).toEqual({ id: 1 });
    });

    it('GESTOR remove com forceMemberScope no assert', async () => {
      prisma.plano_trabalho.findUnique.mockResolvedValue({ id: 1 });
      prisma.$queryRawUnsafe.mockResolvedValue([]);
      prisma.plano_trabalho.delete.mockResolvedValue({ id: 1 });

      await service.remove(1, adminUser);

      expect(mockAccessService.assertCanAccessPlan).toHaveBeenCalledWith(adminUser, 1, {
        forceMemberScope: true,
      });
      expect(prisma.plano_trabalho.delete).toHaveBeenCalled();
    });

    it('COORDENADOR sem membership → 403', async () => {
      mockAccessService.assertCanAccessPlan.mockRejectedValue(
        new ForbiddenException('Sem permissão'),
      );

      await expect(service.remove(1, coordUser)).rejects.toBeInstanceOf(ForbiddenException);
      expect(prisma.plano_trabalho.delete).not.toHaveBeenCalled();
    });
  });
});
