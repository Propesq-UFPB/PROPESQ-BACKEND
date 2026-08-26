export class findOneResearchDto {
  id: number;
  tipo: string;
  codigo: string;
  titulo: string;
  title: string;
  categoria: string;
  situacao: string;
  objetivos: ObjetivoRelacionado[];
  email: string;
  data_cadastro: string;
  palavras_chave: string[];
  key_words: string[];
  corpo?: CorpoProjeto;
  atividades: Atividade[];
  unidade?: string;
  membros?: MembroProjeto[];
  anexo?: AnexoProjeto;
}

export class Atividade {
  descricao: string;
  meses: Date[];
}

export class ObjetivoRelacionado {
  id: number;
  name: string;
}

export class CorpoProjeto {
  resumo: string;
  abstract: string;
  introducao: string;
  objetivos: string;
  metodologia: string;
  resultados_esperados?: string | null;
  referencias: string;
}

export class MembroProjeto {
  id: number;
  nome: string;
  email: string;
  funcao: string;
  categoria: string;
  carga_horaria?: number;
  cpf?: string;
  sexo?: string;
  formacao?: string;
  tipo?: string;
}

export class AnexoProjeto {
  id: number;
  nome: string;
  tipo: string;
}
