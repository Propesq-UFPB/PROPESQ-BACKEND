export class findOneResearchDto {
  id: number;
  tipo: string;
  codigo: string;
  titulo: string;
  title: string;
  categoria: string;
  situacao: string;
  objetivos: Array<string>;
  email: string;
  data_cadastro: string;
  palavras_chave: string[];
  key_words: string[];
  corpo?: CorpoProjeto;
}

export class CorpoProjeto {
  resumo: string;
  abstract: string;
  introducao: string;
  objetivos: string;
  metodologia: string;
  referencias: string;
  resultados_esperados: string;
}
