import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UpdatePerfilDiscenteDto } from '../work-plan/dto/update-perfil-discente.dto';

@Injectable()
export class DiscentesService {
  constructor(private readonly prisma: PrismaService) {}

  async updatePerfil(discenteId: number, dto: UpdatePerfilDiscenteDto) {
    const discente = await this.prisma.discente.findUnique({
      where: { id: discenteId },
      include: { perfil: true, usuario: true },
    });

    if (!discente) {
      throw new NotFoundException(`Discente com ID ${discenteId} não encontrado`);
    }

    const { matricula, lattes_url, ...perfilFields } = dto;

    await this.prisma.$transaction(async tx => {
      if (matricula !== undefined || lattes_url !== undefined) {
        await tx.discente.update({
          where: { id: discenteId },
          data: {
            ...(matricula !== undefined && { matricula }),
            ...(lattes_url !== undefined && { lattes_url }),
          },
        });
      }

      const data: Prisma.perfil_discenteUncheckedCreateInput = {
        discente_id: discenteId,
        ...(perfilFields.data_nascimento !== undefined && {
          data_nascimento: new Date(perfilFields.data_nascimento),
        }),
        ...(perfilFields.sexo !== undefined && { sexo: perfilFields.sexo }),
        ...(perfilFields.raca !== undefined && { raca: perfilFields.raca }),
        ...(perfilFields.estado_civil !== undefined && {
          estado_civil: perfilFields.estado_civil,
        }),
        ...(perfilFields.nacionalidade !== undefined && {
          nacionalidade: perfilFields.nacionalidade,
        }),
        ...(perfilFields.naturalidade !== undefined && {
          naturalidade: perfilFields.naturalidade,
        }),
        ...(perfilFields.tipo_sanguineo !== undefined && {
          tipo_sanguineo: perfilFields.tipo_sanguineo,
        }),
        ...(perfilFields.nome_pai !== undefined && { nome_pai: perfilFields.nome_pai }),
        ...(perfilFields.nome_mae !== undefined && { nome_mae: perfilFields.nome_mae }),
        ...(perfilFields.cpf !== undefined && { cpf: perfilFields.cpf }),
        ...(perfilFields.rg !== undefined && { rg: perfilFields.rg }),
        ...(perfilFields.rg_emissao !== undefined && {
          rg_emissao: new Date(perfilFields.rg_emissao),
        }),
        ...(perfilFields.orgao_emissor !== undefined && {
          orgao_emissor: perfilFields.orgao_emissor,
        }),
        ...(perfilFields.titulo_eleitor !== undefined && {
          titulo_eleitor: perfilFields.titulo_eleitor,
        }),
        ...(perfilFields.zona_eleitoral !== undefined && {
          zona_eleitoral: perfilFields.zona_eleitoral,
        }),
        ...(perfilFields.secao_eleitoral !== undefined && {
          secao_eleitoral: perfilFields.secao_eleitoral,
        }),
        ...(perfilFields.certificado_militar !== undefined && {
          certificado_militar: perfilFields.certificado_militar,
        }),
        ...(perfilFields.categoria_militar !== undefined && {
          categoria_militar: perfilFields.categoria_militar,
        }),
        ...(perfilFields.cep !== undefined && { cep: perfilFields.cep }),
        ...(perfilFields.tipo_logradouro !== undefined && {
          tipo_logradouro: perfilFields.tipo_logradouro,
        }),
        ...(perfilFields.logradouro !== undefined && {
          logradouro: perfilFields.logradouro,
        }),
        ...(perfilFields.numero !== undefined && { numero: perfilFields.numero }),
        ...(perfilFields.complemento !== undefined && {
          complemento: perfilFields.complemento,
        }),
        ...(perfilFields.bairro !== undefined && { bairro: perfilFields.bairro }),
        ...(perfilFields.uf !== undefined && { uf: perfilFields.uf }),
        ...(perfilFields.cidade !== undefined && { cidade: perfilFields.cidade }),
        ...(perfilFields.pais !== undefined && { pais: perfilFields.pais }),
        ...(perfilFields.telefone_ddd !== undefined && {
          telefone_ddd: perfilFields.telefone_ddd,
        }),
        ...(perfilFields.telefone !== undefined && { telefone: perfilFields.telefone }),
        ...(perfilFields.celular_ddd !== undefined && {
          celular_ddd: perfilFields.celular_ddd,
        }),
        ...(perfilFields.celular !== undefined && { celular: perfilFields.celular }),
        ...(perfilFields.curso !== undefined && { curso: perfilFields.curso }),
        ...(perfilFields.campus !== undefined && { campus: perfilFields.campus }),
        ...(perfilFields.periodo !== undefined && { periodo: perfilFields.periodo }),
        ...(perfilFields.semestre !== undefined && { semestre: perfilFields.semestre }),
        ...(perfilFields.cra !== undefined && { cra: perfilFields.cra }),
        ...(perfilFields.creditos_concluidos !== undefined && {
          creditos_concluidos: perfilFields.creditos_concluidos,
        }),
        ...(perfilFields.reprovacoes !== undefined && {
          reprovacoes: perfilFields.reprovacoes,
        }),
        ...(perfilFields.situacao_academica !== undefined && {
          situacao_academica: perfilFields.situacao_academica,
        }),
        ...(perfilFields.situacao_matricula !== undefined && {
          situacao_matricula: perfilFields.situacao_matricula,
        }),
        ...(perfilFields.possui_necessidade !== undefined && {
          possui_necessidade: perfilFields.possui_necessidade,
        }),
        ...(perfilFields.tipo_necessidade !== undefined && {
          tipo_necessidade: perfilFields.tipo_necessidade,
        }),
      };

      const hasPerfilUpdate = Object.keys(data).length > 1; // besides discente_id
      if (hasPerfilUpdate) {
        const { discente_id: _, ...updateData } = data;
        await tx.perfil_discente.upsert({
          where: { discente_id: discenteId },
          create: data,
          update: updateData,
        });
      }
    });

    return this.prisma.discente.findUnique({
      where: { id: discenteId },
      include: { perfil: true, usuario: { select: { id: true, nome: true, email: true } } },
    });
  }
}
