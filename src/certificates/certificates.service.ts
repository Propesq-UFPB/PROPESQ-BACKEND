import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { PaginatedResult } from '../common/dto/paginated.dto';
import { CreateCertificateDto } from './dto/create-certificate.dto';
import { CertificateResponseDto } from './dto/certificate-response.dto';

type CertificateWithUser = Prisma.certificadoGetPayload<{
  include: { usuario: true };
}>;

@Injectable()
export class CertificatesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateCertificateDto): Promise<CertificateResponseDto> {
    await this.ensureUsuarioExists(dto.usuario_id);

    if (dto.projeto_pesquisa_id !== undefined) {
      await this.ensureProjectExists(dto.projeto_pesquisa_id);
    }

    try {
      const created = await this.prisma.certificado.create({
        data: {
          usuario_id: dto.usuario_id,
          projeto_pesquisa_id: dto.projeto_pesquisa_id ?? null,
          tipo: dto.tipo.trim(),
          codigo: dto.codigo.trim(),
          emitido_em: new Date(dto.emitido_em),
        },
        include: { usuario: true },
      });
      return this.toResponseDto(created);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException(`Já existe um certificado com o código "${dto.codigo}".`);
      }
      throw error;
    }
  }

  async findAll(
    limit: number,
    offset: number,
  ): Promise<PaginatedResult<CertificateResponseDto>> {
    const [total, rows] = await this.prisma.$transaction([
      this.prisma.certificado.count(),
      this.prisma.certificado.findMany({
        take: limit,
        skip: offset,
        orderBy: { emitido_em: 'desc' },
        include: { usuario: true },
      }),
    ]);

    return {
      total,
      limit,
      offset,
      results: rows.map(row => this.toResponseDto(row)),
    };
  }

  async findOne(id: number): Promise<CertificateResponseDto> {
    const cert = await this.prisma.certificado.findUnique({
      where: { id },
      include: { usuario: true },
    });

    if (!cert) {
      throw new NotFoundException(`Certificado com id ${id} não encontrado.`);
    }

    return this.toResponseDto(cert);
  }

  private async ensureUsuarioExists(id: number): Promise<void> {
    const user = await this.prisma.usuario.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException(`Usuário com id ${id} não encontrado.`);
    }
  }

  private async ensureProjectExists(id: number): Promise<void> {
    const project = await this.prisma.projeto_pesquisa.findUnique({ where: { id } });
    if (!project) {
      throw new NotFoundException(`Projeto com id ${id} não encontrado.`);
    }
  }

  private toResponseDto(row: CertificateWithUser): CertificateResponseDto {
    return {
      id: row.id,
      usuario_id: row.usuario_id,
      projeto_pesquisa_id: row.projeto_pesquisa_id,
      tipo: row.tipo,
      codigo: row.codigo,
      emitido_em: row.emitido_em.toISOString(),
      criado_em: row.criado_em.toISOString(),
      usuario_nome: row.usuario.nome,
    };
  }
}
