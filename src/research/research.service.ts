import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateResearchDto } from './dto/create-research.dto';
import { UpdateResearchDto } from './dto/update-research.dto';
import { researchData } from './data';
import { Research } from './entities/research.entity';

@Injectable()
export class ResearchService {
  private researchData: Research[] = researchData as Research[];
  private nextId: number =
    this.researchData.length > 0
      ? Math.max(...this.researchData.map((r) => r.id)) + 1
      : 1;

  create(createResearchDto: CreateResearchDto): Research {
    const newResearch: Research = {
      id: this.nextId++,
      ...createResearchDto,
    };

    this.researchData.push(newResearch);
    return newResearch;
  }

  findAll(): Research[] {
    return this.researchData;
  }

  findOne(id: number): Research {
    const research = this.researchData.find((r) => r.id === id);
    if (!research) {
      // Exceção padrão do NestJS para indicar que o recurso não foi encontrado
      throw new NotFoundException(`Pesquisa com ID #${id} não encontrada.`);
    }
    return research;
  }

  update(id: number, updateResearchDto: UpdateResearchDto): Research {
    const existingResearch = this.findOne(id); // Usa findOne para verificar e obter

    // Encontra o índice e substitui/atualiza as propriedades
    const researchIndex = this.researchData.findIndex((r) => r.id === id);

    // Sobrescreve as propriedades com as do DTO
    this.researchData[researchIndex] = {
      ...existingResearch,
      ...updateResearchDto, // O PartialType permite a atualização parcial
    };

    return this.researchData[researchIndex];
  }

  remove(id: number): void {
    const initialLength = this.researchData.length;

    // Filtra para remover o item com o ID especificado
    this.researchData = this.researchData.filter((r) => r.id !== id);

    // Se o tamanho do array não mudou, significa que o ID não foi encontrado
    if (this.researchData.length === initialLength) {
      throw new NotFoundException(`Pesquisa com ID #${id} não encontrada.`);
    }
  }
}
