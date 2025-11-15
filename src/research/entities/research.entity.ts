import { ApiProperty } from '@nestjs/swagger';

class AreaDeConhecimentoDto {
  @ApiProperty({
    example: 'Engenharias',
    description: 'Grande área do conhecimento (CNPq).',
  })
  grande_area: string;

  @ApiProperty({
    example: 'Engenharia Elétrica',
    description: 'Área principal do conhecimento.',
  })
  area: string;

  @ApiProperty({
    example: 'Eletrônica Industrial, Sistemas e Controles Eletrônicos',
    description: 'Subárea do conhecimento.',
  })
  subarea: string;

  @ApiProperty({
    example: 'Automação Eletrônica de Processos Elétricos e Industriais',
    description: 'Especialidade do conhecimento.',
  })
  especialidade: string;
}

class CronogramaDeAtividadesDto {
  @ApiProperty({
    example: [
      'REVISÃO TÉCNICA',
      'INSTALAÇÃO E CONFIGURAÇÃO DE AMBIENTES SCADA',
      'CRIAÇÃO DE MODELOS DE INTERFACE GRÁFICA',
    ],
    description: 'Lista de todas as atividades do plano de trabalho.',
  })
  atividades: string[];

  @ApiProperty({
    example: {
      '2025': {
        Set: 'REVISÃO TÉCNICA',
        Nov: 'INSTALAÇÃO E CONFIGURAÇÃO DE AMBIENTES SCADA',
      },
      '2026': {
        Mar: 'INTEGRAÇÃO COM DADOS REAIS E SIMULADOS',
      },
    },
    description:
      'Distribuição das atividades pelos meses e anos. Pode ser uma string ou um array de strings.',
  })
  meses: {
    [year: string]: {
      [month: string]: string | string[];
    };
  };
}

class CorpoDoPlanoDeTrabalhoDto {
  @ApiProperty({
    example:
      'Implementação de Sistemas Supervisórios de Código Aberto para Simulação de Processos Industriais em Ambientes Educacionais',
    description: 'Título do plano de trabalho em Português.',
  })
  titulo: string;

  @ApiProperty({
    example:
      'Implementation of Open-Source Supervisory Systems for Simulation of Industrial Processes in Educational Environments',
    description: 'Título do plano de trabalho em Inglês.',
  })
  title: string;

  @ApiProperty({
    example:
      'Sistemas supervisórios (SCADA) são elementos centrais na automação industrial...',
    description: 'Introdução e justificativa do trabalho.',
  })
  introducao_e_justificativa: string;

  @ApiProperty({
    example: [
      'Estruturar ferramentas SCADA de código aberto',
      'Configurar interfaces supervisórias',
    ],
    description: 'Lista de objetivos do plano de trabalho.',
  })
  objetivos: string[];

  @ApiProperty({
    example: [
      'Revisão técnica sobre sistemas SCADA',
      'Instalação e configuração de ambientes SCADA de código aberto',
    ],
    description: 'Metodologia utilizada no trabalho.',
  })
  metodologia: string[];

  @ApiProperty({
    example: [
      'SCADABR. Sistema supervisório de código aberto. ...',
      'IBM. Node-RED: Visual programming for event-driven applications. ...',
    ],
    description: 'Lista de referências bibliográficas.',
  })
  referencias: string[];

  @ApiProperty({
    type: CronogramaDeAtividadesDto,
    description: 'Cronograma detalhado do plano de trabalho.',
  })
  cronograma_de_atividades: CronogramaDeAtividadesDto;
}

export class Research {
  @ApiProperty({
    example: 1,
    description: 'ID único da pesquisa.',
    required: false,
  })
  id: number;

  @ApiProperty({
    example:
      'PVK20204-2025 - InduLearn – Sistema Didático Aberto para Simulação e Controle de Processos Industriais',
    description: 'Título do projeto de trabalho ou pesquisa.',
  })
  projeto_de_trabalho: string;

  @ApiProperty({
    example: 'CEAR - CENTRO DE ENERGIAS E ALTERNATIVAS E RENOVÁVEIS',
    description: 'Centro de ensino/pesquisa.',
  })
  Centro: string;

  @ApiProperty({
    example: 'CEAR - DEPARTAMENTO DE ENGENHARIA ELÉTRICA',
    description: 'Departamento de ensino/pesquisa.',
  })
  Departamento: string;

  @ApiProperty({
    example: 'PIVIC (IC)',
    description: 'Tipo de bolsa (e.g., PIVIC, PIBIC, A DEFINIR).',
  })
  tipo_de_bolsa: string;

  @ApiProperty({
    example: 'Iniciação Científica',
    description: 'Direcionamento do plano (e.g., Iniciação Científica).',
  })
  direcionamento_do_plano: string;

  @ApiProperty({
    example: 'EM ANDAMENTO',
    description: 'Status atual do plano (e.g., EM ANDAMENTO, APROVADO).',
  })
  status_do_plano: string;

  @ApiProperty({
    example: '01/09/2025 a 31/08/2026',
    description: 'Período de vigência do plano.',
  })
  periodo: string;

  @ApiProperty({
    type: AreaDeConhecimentoDto,
    description: 'Detalhamento da área de conhecimento.',
  })
  area_de_conhecimento: AreaDeConhecimentoDto;

  @ApiProperty({
    type: CorpoDoPlanoDeTrabalhoDto,
    description: 'Corpo detalhado do plano de trabalho/pesquisa.',
  })
  corpo_do_plano_de_trabalho: CorpoDoPlanoDeTrabalhoDto;
}
