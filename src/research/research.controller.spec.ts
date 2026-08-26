import { Test, TestingModule } from '@nestjs/testing';
import { ResearchController } from './research.controller';
import { ResearchService } from './research.service';
import { CreateResearchDto } from './dto/create-research.dto';
import { updateResearchDto } from './dto/update-research.dto';
import { TipoProjeto } from '@prisma/client';
import { ROLES_KEY } from '../auth/decorators/roles.decorator';

const mockResearchService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  publish: jest.fn(),
  finalDecision: jest.fn(),
  getRanking: jest.fn(),
  uploadAttachment: jest.fn(),
  getAttachment: jest.fn(),
  delete: jest.fn(),
};

describe('ResearchController', () => {
  let controller: ResearchController;
  let service: ResearchService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ResearchController],
      providers: [
        {
          provide: ResearchService,
          useValue: mockResearchService,
        },
      ],
    }).compile();

    controller = module.get<ResearchController>(ResearchController);
    service = module.get<ResearchService>(ResearchService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve estar definido', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('deve permitir criação apenas para gestor e coordenador', () => {
      expect(Reflect.getMetadata(ROLES_KEY, ResearchController.prototype.create)).toEqual([
        'GESTOR',
        'COORDENADOR',
      ]);
    });

    it('deve chamar service.create com o payload correto', async () => {
      const dto: CreateResearchDto = {
        tipo: TipoProjeto.INTERNO,
        titulo: 'Projeto em PT',
        title: 'Project in EN',
        categoria_id: 1,
        edital_id: 2,
        vigencia: new Date('2026-01-01') as any,
        data_inicio: new Date('2026-01-02') as any,
        data_fim: new Date('2026-12-31') as any,
        email: 'research@example.com',
        palavras_chave_ids: [1],
        pesquisa_objetivo_ids: [10],
        corpo_projeto: {
          resumo: 'Resumo',
          abstract: 'Abstract',
          introducao: 'Introdução',
          objetivos: 'Objetivos',
          metodologia: 'Metodologia',
          resultados_esperados: 'Resultados esperados',
          referencias: 'Referências',
        },
        atividades: [
          {
            descricao: 'Atividade de pesquisa',
            meses: [{ data: '2026-01-01' }],
          },
        ],
        unidade_id: 3,
        area_conhecimento_id: 1,
        linha_pesquisa: 'Linha de pesquisa',
      };

      mockResearchService.create.mockResolvedValue({ id: 1 });

      const result = await controller.create(dto);

      expect(service.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual({ id: 1 });
    });
  });

  describe('uploadAttachment', () => {
    it('deve delegar o envio do arquivo e possuir as mesmas permissões da criação', async () => {
      const file = {
        buffer: Buffer.from('%PDF'),
        mimetype: 'application/pdf',
        originalname: 'projeto.pdf',
      };
      mockResearchService.uploadAttachment.mockResolvedValue({ id: 1 });

      await controller.uploadAttachment(2, file);

      expect(service.uploadAttachment).toHaveBeenCalledWith(2, file);
      expect(Reflect.getMetadata(ROLES_KEY, ResearchController.prototype.uploadAttachment)).toEqual(
        ['GESTOR', 'COORDENADOR'],
      );
    });
  });

  describe('getAttachment', () => {
    it('deve enviar o PDF associado ao projeto', async () => {
      const currentUser = {
        userId: 1,
        email: 'gestor@teste.com',
        nome: 'Gestor',
        funcao: 'GESTOR',
      };
      const response = {
        setHeader: jest.fn(),
        send: jest.fn(),
      };
      const arquivo = Buffer.from('%PDF');
      mockResearchService.getAttachment.mockResolvedValue({
        arquivo,
        nome: 'projeto-pesquisa.pdf',
        tipo: 'application/pdf',
      });

      await controller.getAttachment(2, currentUser, response as any);

      expect(service.getAttachment).toHaveBeenCalledWith(2, currentUser);
      expect(response.setHeader).toHaveBeenCalledWith('Content-Type', 'application/pdf');
      expect(response.setHeader).toHaveBeenCalledWith(
        'Content-Disposition',
        'inline; filename="projeto-pesquisa.pdf"',
      );
      expect(response.send).toHaveBeenCalledWith(arquivo);
    });
  });

  describe('findAll', () => {
    it('deve repassar paginação padrão e usuário', async () => {
      mockResearchService.findAll.mockResolvedValue({ total: 0, results: [] });
      const user = {
        userId: 1,
        email: 'admin@teste.com',
        nome: 'Admin',
        funcao: 'GESTOR',
      };

      await controller.findAll('10', '0', user);

      expect(service.findAll).toHaveBeenCalledWith(10, 0, user);
    });

    it('deve repassar paginação informada', async () => {
      mockResearchService.findAll.mockResolvedValue({ total: 0, results: [] });
      const user = {
        userId: 1,
        email: 'admin@teste.com',
        nome: 'Admin',
        funcao: 'GESTOR',
      };

      await controller.findAll('20', '5', user);

      expect(service.findAll).toHaveBeenCalledWith(20, 5, user);
    });
  });

  describe('findOne', () => {
    it('deve chamar service.findOne com id numérico', async () => {
      mockResearchService.findOne.mockResolvedValue({ id: 1 });

      await controller.findOne(1);

      expect(service.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('update', () => {
    it('deve chamar service.update com o dto de atualização', async () => {
      const dto: updateResearchDto = {
        titulo: 'Novo título',
        data_inicio: new Date('2026-02-01') as any,
      };

      mockResearchService.update.mockResolvedValue({ id: 1 });

      await controller.update(1, dto);

      expect(service.update).toHaveBeenCalledWith(1, dto);
    });
  });

  describe('delete', () => {
    it('deve chamar service.delete com o id numérico', async () => {
      mockResearchService.delete.mockResolvedValue({ id: 1 });

      await controller.delete(1);

      expect(service.delete).toHaveBeenCalledWith(1);
    });
  });

  describe('publish', () => {
    it('deve chamar service.publish com id e usuário atual', async () => {
      mockResearchService.publish.mockResolvedValue(undefined);

      await controller.publish(1, {
        userId: 10,
        email: 'coord@teste.com',
        nome: 'Coord',
        funcao: 'COORDENADOR',
      });

      expect(service.publish).toHaveBeenCalledWith(
        1,
        expect.objectContaining({
          userId: 10,
          funcao: 'COORDENADOR',
        }),
      );
    });
  });

  describe('finalDecision', () => {
    it('deve chamar service.finalDecision com o id e o usuário atual', async () => {
      mockResearchService.finalDecision.mockResolvedValue(undefined);

      await controller.finalDecision(
        1,
        {
          situacao: 'APROVADO' as any,
          justificativa: 'Parecer final aprovado',
        },
        {
          userId: 10,
          email: 'gestor@teste.com',
          nome: 'Gestor',
          funcao: 'GESTOR',
        },
      );

      expect(service.finalDecision).toHaveBeenCalledWith(
        1,
        10,
        expect.objectContaining({
          situacao: 'APROVADO',
          justificativa: 'Parecer final aprovado',
        }),
      );
    });
  });

  describe('getRanking', () => {
    it('deve chamar service.getRanking com a paginação padrao', async () => {
      mockResearchService.getRanking.mockResolvedValue({ total: 0, results: [] });

      await controller.getRanking();

      expect(service.getRanking).toHaveBeenCalledWith(10, 0);
    });

    it('deve chamar service.getRanking com paginação informada', async () => {
      mockResearchService.getRanking.mockResolvedValue({ total: 0, results: [] });

      await controller.getRanking('25', '5');

      expect(service.getRanking).toHaveBeenCalledWith(25, 5);
    });
  });
});
