import { ApiProperty } from '@nestjs/swagger';

class DiscenteDto {
  @ApiProperty({
    example: 1,
    description: 'ID do discente',
  })
  id!: number;

  @ApiProperty({
    example: 1,
    description: 'ID do usuário associado ao discente',
  })
  usuario_id!: number;

  usuario?: {
    id: number;
    nome: string;
    email: string;
  };
}

class UsuarioDto {
  @ApiProperty({
    example: 1,
    description: 'ID do usuário',
  })
  id!: number;

  @ApiProperty({
    example: 'João Silva',
    description: 'Nome do usuário',
  })
  nome!: string;

  @ApiProperty({
    example: 'joao@example.com',
    description: 'Email do usuário',
  })
  email!: string;
}

class CronogramaDto {
  @ApiProperty({
    example: 1,
    description: 'ID do cronograma',
  })
  id!: number;

  @ApiProperty({
    example: '2025-01-15',
    description: 'Data de início do cronograma',
    type: 'string',
    format: 'date',
  })
  data_inicio!: Date;

  @ApiProperty({
    example: '2025-12-31',
    description: 'Data de fim do cronograma',
    type: 'string',
    format: 'date',
  })
  data_fim!: Date;

  @ApiProperty({
    example: 1,
    description: 'ID da atividade associada',
  })
  atividade_id!: number;
}

class CorpoPlanoTrabalhoDto {
  @ApiProperty({
    example: 1,
    description: 'ID do corpo do plano de trabalho',
  })
  id!: number;

  @ApiProperty({
    example: 'Desenvolvimento de Sistema',
    description: 'Título do plano',
  })
  titulo!: string;

  @ApiProperty({
    example: 'Introdução ao projeto...',
    description: 'Introdução do plano',
  })
  introducao!: string;

  @ApiProperty({
    example: 'Desenvolver um sistema de gestão...',
    description: 'Objetivos do plano',
  })
  objetivos!: string;

  @ApiProperty({
    example: 'Será utilizado metodologia ágil...',
    description: 'Metodologia a ser utilizada',
  })
  metodologia!: string;

  @ApiProperty({
    example: 'Referências bibliográficas...',
    description: 'Referências do plano',
  })
  referencias!: string;
}

export class WorkPlan {
  @ApiProperty({
    example: 1,
    description: 'ID único do plano de trabalho',
  })
  id!: number;

  @ApiProperty({
    example: 1,
    description: 'ID do discente associado',
  })
  discente_id!: number;

  @ApiProperty({
    example: 1,
    description: 'ID do usuário (orientador) associado',
  })
  usuario_id!: number;

  @ApiProperty({
    example: 'Iniciação Científica',
    description: 'Modalidade do plano de trabalho',
  })
  modalidade!: string;

  @ApiProperty({
    example: 'Em desenvolvimento',
    description: 'Status do plano de trabalho',
  })
  status!: string;

  @ApiProperty({
    example: 'Bolsa PIBIC',
    description: 'Tipo de bolsa',
  })
  tipo_bolsa!: string;

  @ApiProperty({
    example: 1,
    description: 'ID do cronograma associado',
  })
  cronograma_id!: number;

  @ApiProperty({
    example: 'Direcionamento do plano...',
    description: 'Direcionamento/orientação do plano',
  })
  direcionamento_plano!: string;

  @ApiProperty({
    example: 1,
    description: 'ID do corpo do plano de trabalho',
  })
  corpo_id!: number;

  @ApiProperty({
    type: DiscenteDto,
    description: 'Informações do discente',
  })
  discente?: DiscenteDto;

  @ApiProperty({
    type: UsuarioDto,
    description: 'Informações do usuário (orientador)',
  })
  usuario?: UsuarioDto;

  @ApiProperty({
    type: CronogramaDto,
    description: 'Informações do cronograma',
  })
  cronograma?: CronogramaDto;

  @ApiProperty({
    type: CorpoPlanoTrabalhoDto,
    description: 'Informações do corpo do plano',
  })
  corpo_plano_trabalho?: CorpoPlanoTrabalhoDto;

  @ApiProperty({
    isArray: true,
    description: 'Lista de projetos de pesquisa associados',
  })
  projeto_pesquisa?: any[];
}
