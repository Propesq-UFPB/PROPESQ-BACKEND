import { Test, TestingModule } from '@nestjs/testing';
import { ResearchService } from './research.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';
import { CreateResearchDto } from './dto/create-research.dto';
import { UpdateResearchDto } from './dto/update-research.dto';

// Mock do PrismaService para evitar erros de injeção de dependência
// Como a lógica atual usa array em memória, o mock pode ser vazio.
const mockPrismaService = {};

describe('ResearchService', () => {
  let service: ResearchService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ResearchService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ResearchService>(ResearchService);
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('deve retornar um array de pesquisas', () => {
      const result = service.findAll();
      expect(Array.isArray(result)).toBe(true);
      // Verifica se carregou os dados iniciais do arquivo data.ts
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('findOne', () => {
    it('deve retornar uma pesquisa específica pelo ID', () => {
      // O ID 1 existe no data.ts
      const result = service.findOne(1);
      expect(result).toBeDefined();
      expect(result.id).toBe(1);
    });

    it('deve lançar NotFoundException para ID inexistente', () => {
      expect(() => service.findOne(9999)).toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('deve criar uma nova pesquisa', () => {
      const createDto: CreateResearchDto = {
        projeto_de_trabalho: 'Novo Projeto de Teste',
        Centro: 'Centro de Teste',
        Departamento: 'Dept Teste',
        tipo_de_bolsa: 'Voluntário',
        direcionamento_do_plano: 'IC',
        status_do_plano: 'EM ANÁLISE',
        periodo: '2025-2026',
        area_de_conhecimento: {
          grande_area: 'Exatas',
          area: 'Computação',
          subarea: 'Sistemas',
          especialidade: 'Testes',
        },
        corpo_do_plano_de_trabalho: {
            titulo: 'Teste Unitário',
            title: 'Unit Test',
            introducao_e_justificativa: 'Justificativa...',
            objetivos: ['Objetivo 1'],
            metodologia: ['Metodologia 1'],
            referencias: ['Ref 1'],
            cronograma_de_atividades: {
                atividades: ['Atv 1'],
                meses: { '2025': { Jan: 'Atv 1' } }
            }
        }
      };

      const result = service.create(createDto);

      expect(result).toHaveProperty('id');
      expect(result.projeto_de_trabalho).toBe(createDto.projeto_de_trabalho);
      
      // Verifica se foi adicionado à lista
      const inMemoryList = service.findAll();
      expect(inMemoryList).toContainEqual(result);
    });
  });

  describe('update', () => {
    it('deve atualizar uma pesquisa existente', () => {
      const updateDto: UpdateResearchDto = {
        projeto_de_trabalho: 'Projeto Atualizado',
      };

      // Atualiza o ID 1
      const result = service.update(1, updateDto);

      expect(result.projeto_de_trabalho).toBe('Projeto Atualizado');
      
      // Verifica persistência na memória
      const item = service.findOne(1);
      expect(item.projeto_de_trabalho).toBe('Projeto Atualizado');
    });

    it('deve lançar NotFoundException ao tentar atualizar ID inexistente', () => {
      const updateDto: UpdateResearchDto = { projeto_de_trabalho: 'Falha' };
      expect(() => service.update(9999, updateDto)).toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('deve remover uma pesquisa existente', () => {
      const idParaRemover = 2;
      service.remove(idParaRemover);

      expect(() => service.findOne(idParaRemover)).toThrow(NotFoundException);
    });

    it('deve lançar NotFoundException ao tentar remover ID inexistente', () => {
      expect(() => service.remove(9999)).toThrow(NotFoundException);
    });
  });
});
