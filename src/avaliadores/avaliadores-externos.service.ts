import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, TipoAvaliador } from '@prisma/client';
import { randomBytes } from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service';
import { FUNCAO_AVALIADOR_EXTERNO } from '../auth/funcoes';
import { gerarToken, hashToken, urlDoLink } from '../acesso-externo/token';
import { AvaliadoresService, avaliadorInclude } from './avaliadores.service';
import {
  AvaliadorExternoCriadoDto,
  AvaliadorExternoResponseDto,
  CreateAvaliadorExternoDto,
  LinkAcessoDto,
  LinkAcessoStatusDto,
  UpdateAvaliadorExternoDto,
} from './dto/avaliador-externo.dto';

type DadosExternos = Omit<
  Prisma.avaliador_externoUncheckedCreateInput,
  'avaliador_id' | 'instituicao'
> & { instituicao?: string };

/** Campos de avaliador_externo presentes no DTO (só os enviados). */
function dadosExternos(dto: UpdateAvaliadorExternoDto): DadosExternos {
  return {
    instituicao: dto.instituicao,
    titulacao: dto.titulacao,
    cpf: dto.cpf,
    pais: dto.pais,
    telefone: dto.telefone,
    lattes_url: dto.lattes_url,
    orcid: dto.orcid,
    observacao: dto.observacao,
  };
}

/** Link válido: não revogado e não expirado. */
const linkValidoWhere = (agora: Date): Prisma.avaliador_acessoWhereInput => ({
  revogado_em: null,
  OR: [{ expira_em: null }, { expira_em: { gt: agora } }],
});

@Injectable()
export class AvaliadoresExternosService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly avaliadores: AvaliadoresService,
  ) {}

  /**
   * Cadastra o avaliador externo e devolve o primeiro link de acesso. Por trás dele é criado um
   * usuário de sistema (função AVALIADOR_EXTERNO, sem login) que o representa nas atribuições.
   */
  async create(dto: CreateAvaliadorExternoDto): Promise<AvaliadorExternoCriadoDto> {
    const expiraEm = this.validarExpiracao(dto.link_expira_em);
    const adicionais = this.avaliadores.normalizarAdicionais(
      dto.area_principal_id,
      dto.areas_adicionais_ids,
    );
    await this.avaliadores.assertAreasExistem([dto.area_principal_id, ...adicionais]);
    await this.assertEmailDisponivel(dto.email);
    const funcaoId = await this.funcaoExternoId();

    const token = gerarToken();
    const avaliador = await this.prisma.$transaction(async tx => {
      const usuario = await tx.usuario.create({
        data: {
          nome: dto.nome,
          email: dto.email,
          // Inutilizável: o login também recusa a função AVALIADOR_EXTERNO
          senha: randomBytes(48).toString('base64url'),
          funcao_id: funcaoId,
        },
        select: { id: true },
      });

      return tx.avaliador.create({
        data: {
          usuario_id: usuario.id,
          tipo: TipoAvaliador.EXTERNO,
          area_principal_id: dto.area_principal_id,
          is_cnpq: dto.is_cnpq ?? false,
          is_voluntario: dto.is_voluntario ?? false,
          ativo: dto.ativo ?? true,
          areas_atualizadas_em: new Date(),
          areas_adicionais: {
            create: adicionais.map(area_conhecimento_id => ({ area_conhecimento_id })),
          },
          externo: { create: { ...dadosExternos(dto), instituicao: dto.instituicao } },
          acessos: { create: { token_hash: hashToken(token), expira_em: expiraEm } },
        },
        select: { id: true },
      });
    });

    return {
      avaliador: await this.findOne(avaliador.id),
      link: { url: urlDoLink(token), expira_em: expiraEm },
    };
  }

  async findOne(id: number): Promise<AvaliadorExternoResponseDto> {
    const agora = new Date();
    const avaliador = await this.prisma.avaliador.findFirst({
      where: { id, tipo: TipoAvaliador.EXTERNO },
      include: {
        ...avaliadorInclude,
        acessos: { orderBy: { criado_em: 'desc' }, take: 1 },
      },
    });
    if (!avaliador) {
      throw new NotFoundException(`Avaliador externo com id ${id} não encontrado.`);
    }

    const [ultimo] = avaliador.acessos;
    const valido =
      !!ultimo && !ultimo.revogado_em && (!ultimo.expira_em || ultimo.expira_em > agora);
    const link: LinkAcessoStatusDto = {
      ativo: valido,
      criado_em: ultimo?.criado_em ?? null,
      expira_em: ultimo?.expira_em ?? null,
      ultimo_acesso_em: ultimo?.ultimo_acesso_em ?? null,
    };

    return { ...this.avaliadores.toResponseDto(avaliador), link };
  }

  async update(id: number, dto: UpdateAvaliadorExternoDto): Promise<AvaliadorExternoResponseDto> {
    const atual = await this.getOrFail(id);

    if (dto.email !== undefined && dto.email.toLowerCase() !== atual.usuario.email.toLowerCase()) {
      await this.assertEmailDisponivel(dto.email);
    }

    // Áreas e flags seguem as regras do cadastro comum
    if (
      dto.area_principal_id !== undefined ||
      dto.areas_adicionais_ids !== undefined ||
      dto.is_cnpq !== undefined ||
      dto.is_voluntario !== undefined ||
      dto.ativo !== undefined
    ) {
      await this.avaliadores.update(id, {
        area_principal_id: dto.area_principal_id,
        areas_adicionais_ids: dto.areas_adicionais_ids,
        is_cnpq: dto.is_cnpq,
        is_voluntario: dto.is_voluntario,
        ativo: dto.ativo,
      });
    }

    await this.prisma.$transaction([
      this.prisma.usuario.update({
        where: { id: atual.usuario_id },
        data: { nome: dto.nome, email: dto.email },
      }),
      this.prisma.avaliador_externo.update({
        where: { avaliador_id: id },
        data: dadosExternos(dto),
      }),
    ]);

    return this.findOne(id);
  }

  /** Gera um novo link e revoga os anteriores (o link só é exibido nesta resposta). */
  async gerarLink(id: number, expiraEmIso?: string): Promise<LinkAcessoDto> {
    const expiraEm = this.validarExpiracao(expiraEmIso);
    await this.getOrFail(id);

    const token = gerarToken();
    const agora = new Date();
    await this.prisma.$transaction([
      this.prisma.avaliador_acesso.updateMany({
        where: { avaliador_id: id, revogado_em: null },
        data: { revogado_em: agora },
      }),
      this.prisma.avaliador_acesso.create({
        data: { avaliador_id: id, token_hash: hashToken(token), expira_em: expiraEm },
      }),
    ]);

    return { url: urlDoLink(token), expira_em: expiraEm };
  }

  /** Revoga o link vigente. Sessões já abertas expiram sozinhas (JWT de curta duração). */
  async revogarLink(id: number): Promise<void> {
    await this.getOrFail(id);

    const { count } = await this.prisma.avaliador_acesso.updateMany({
      where: { avaliador_id: id, ...linkValidoWhere(new Date()) },
      data: { revogado_em: new Date() },
    });
    if (count === 0) {
      throw new NotFoundException('Este avaliador não tem link de acesso válido.');
    }
  }

  private async getOrFail(id: number) {
    const avaliador = await this.prisma.avaliador.findFirst({
      where: { id, tipo: TipoAvaliador.EXTERNO },
      select: { id: true, usuario_id: true, usuario: { select: { email: true } } },
    });
    if (!avaliador) {
      throw new NotFoundException(`Avaliador externo com id ${id} não encontrado.`);
    }
    return avaliador;
  }

  /** E-mail não é único em `usuario`; aqui evita duplicar uma pessoa já cadastrada. */
  private async assertEmailDisponivel(email: string): Promise<void> {
    const existente = await this.prisma.usuario.findFirst({
      where: { email: { equals: email, mode: 'insensitive' } },
      select: { id: true, funcao: { select: { nome: true } } },
    });
    if (!existente) return;

    throw new ConflictException(
      existente.funcao.nome === FUNCAO_AVALIADOR_EXTERNO
        ? `Já existe um avaliador externo com o e-mail ${email}.`
        : `O e-mail ${email} pertence a um usuário do sistema (id ${existente.id}); ` +
          'cadastre-o como avaliador interno em POST /avaliadores.',
    );
  }

  private async funcaoExternoId(): Promise<number> {
    const funcao = await this.prisma.funcao.findUnique({
      where: { nome: FUNCAO_AVALIADOR_EXTERNO },
      select: { id: true },
    });
    if (!funcao) {
      // Criada pela migration add_avaliador_externo
      throw new InternalServerErrorException(
        `Função ${FUNCAO_AVALIADOR_EXTERNO} ausente; rode as migrations.`,
      );
    }
    return funcao.id;
  }

  private validarExpiracao(iso?: string): Date | null {
    if (!iso) return null;
    const data = new Date(iso);
    if (data <= new Date()) {
      throw new BadRequestException('A validade do link deve ser uma data futura.');
    }
    return data;
  }
}
