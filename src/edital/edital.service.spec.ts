import { Test, TestingModule } from '@nestjs/testing';
import { StatusEdital, TipoEdital, TitulacaoMin } from '@prisma/client';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEditalDto } from './dto/create-edital.dto';
import { EditalService } from './edital.service';

const mockPrismaService = {
  edital: {
    count: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  anexo_edital: {
    upsert: jest.fn(),
  },
  unidade_academica: {
    findMany: jest.fn(),
  },
  edital_unidade_academica: {
    createMany: jest.fn(),
    deleteMany: jest.fn(),
  },
  $transaction: jest.fn(),
};

const validCreatePayload = {
  codigo: 'EDITAL-2026-01',
  descricao: 'Edital PIBIC 2026',
  status: StatusEdital.RASCUNHO,
  titulacao_min: TitulacaoMin.DOUTORADO,
  tipo: TipoEdital.PESQUISA,
  limite_solicitacoes_orientador: 2,
  cota_bolsa_id: 1,
  limite_planos_orientador: 2,
  avaliacao_vigente: true,
  apenas_orient_coordena_plano: true,
  tec_admin_coord_proj: false,
  divulgar_resultado: true,
  categoria_id: 1,
  edital_cota_distribuicao: [],
  periodo_submissao: {
    inicio: '2026-05-01',
    fim: '2026-05-31',
  },
  periodo_execucao: {
    inicio: '2026-08-01',
    fim: '2027-07-31',
  },
};

describe('EditalService', () => {
  let service: EditalService;
  let prisma: typeof mockPrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EditalService, { provide: PrismaService, useValue: mockPrismaService }],
    }).compile();

    service = module.get(EditalService);
    prisma = module.get(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('retorna todos os status no lookup', () => {
    expect(service.getStatusLookup()).toEqual([
      { id: StatusEdital.RASCUNHO, name: 'Rascunho' },
      { id: StatusEdital.PUBLICADO, name: 'Publicado' },
      { id: StatusEdital.ENCERRADO, name: 'Encerrado' },
      { id: StatusEdital.ARQUIVADO, name: 'Arquivado' },
    ]);
  });

  it('salva o status escolhido ao cadastrar o edital', async () => {
    prisma.edital.findUnique.mockResolvedValue(null);
    prisma.edital.create.mockResolvedValue({ id: 1 });

    await service.create(validCreatePayload as unknown as CreateEditalDto);

    expect(prisma.edital.create.mock.calls).toHaveLength(1);
    const createCalls = prisma.edital.create.mock.calls as unknown as Array<[unknown]>;
    const createArgument = createCalls[0][0];
    expect(createArgument).toMatchObject({
      data: {
        status: StatusEdital.RASCUNHO,
      },
    });
  });

  it('lista título, período de execução formatado e status', async () => {
    prisma.edital.findMany.mockResolvedValue([
      {
        id: 1,
        descricao: 'Edital PIBIC 2026',
        status: StatusEdital.PUBLICADO,
        periodo_execucao_rel: {
          inicio: new Date('2026-08-01T00:00:00.000Z'),
          fim: new Date('2027-07-31T00:00:00.000Z'),
        },
      },
    ]);
    prisma.edital.count.mockResolvedValue(1);

    await expect(service.findMany(10, 0)).resolves.toEqual({
      limit: 10,
      offset: 0,
      total: 1,
      results: [
        {
          id: 1,
          titulo: 'Edital PIBIC 2026',
          periodo_execucao: '01/08/2026 a 31/07/2027',
          status: StatusEdital.PUBLICADO,
        },
      ],
    });
  });

  it('pesquisa parcialmente pelo título sem diferenciar maiúsculas e minúsculas', async () => {
    prisma.edital.findMany.mockResolvedValue([]);
    prisma.edital.count.mockResolvedValue(0);

    await service.findMany(10, 0, '  pibic  ');

    const findManyCalls = prisma.edital.findMany.mock.calls as unknown as Array<[unknown]>;
    const countCalls = prisma.edital.count.mock.calls as unknown as Array<[unknown]>;

    expect(findManyCalls[0][0]).toMatchObject({
      where: {
        OR: [
          {
            descricao: {
              contains: 'pibic',
              mode: 'insensitive',
            },
          },
        ],
      },
    });
    expect(countCalls[0][0]).toMatchObject({
      where: {
        OR: [
          {
            descricao: {
              contains: 'pibic',
              mode: 'insensitive',
            },
          },
        ],
      },
    });
  });

  it('pesquisa pelo nome parcial do status', async () => {
    prisma.edital.findMany.mockResolvedValue([]);
    prisma.edital.count.mockResolvedValue(0);

    await service.findMany(10, 0, 'publi');

    const findManyCalls = prisma.edital.findMany.mock.calls as unknown as Array<[unknown]>;
    const countCalls = prisma.edital.count.mock.calls as unknown as Array<[unknown]>;
    const expectedWhere = {
      OR: [
        {
          descricao: {
            contains: 'publi',
            mode: 'insensitive',
          },
        },
        {
          status: {
            in: [StatusEdital.PUBLICADO],
          },
        },
      ],
    };

    expect(findManyCalls[0][0]).toMatchObject({ where: expectedWhere });
    expect(countCalls[0][0]).toMatchObject({ where: expectedWhere });
  });

  it('atualiza somente título, período de execução e status', async () => {
    jest.spyOn(service, 'findOne').mockResolvedValue({} as never);
    prisma.edital.update.mockResolvedValue({ id: 1 });

    await service.update(1, {
      titulo: 'Novo título',
      periodo_execucao: {
        inicio: '2026-09-01',
        fim: '2027-08-31',
      },
      status: StatusEdital.PUBLICADO,
    });

    expect(prisma.edital.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: {
        descricao: 'Novo título',
        status: StatusEdital.PUBLICADO,
        periodo_execucao_rel: {
          update: {
            data: {
              inicio: new Date('2026-09-01T00:00:00.000Z'),
              fim: new Date('2027-08-31T00:00:00.000Z'),
            },
          },
        },
      },
    });
  });
});

describe('CreateEditalDto', () => {
  it.each([StatusEdital.RASCUNHO, StatusEdital.PUBLICADO])(
    'aceita o status inicial %s',
    async status => {
      const dto = plainToInstance(CreateEditalDto, {
        ...validCreatePayload,
        status,
      });

      await expect(validate(dto)).resolves.toEqual([]);
    },
  );

  it('rejeita status encerrado no cadastro inicial', async () => {
    const dto = plainToInstance(CreateEditalDto, {
      ...validCreatePayload,
      status: StatusEdital.ENCERRADO,
    });

    const errors = await validate(dto);

    const statusError = errors.find(error => error.property === 'status');
    expect(statusError?.constraints?.isIn).toBeDefined();
  });
});
