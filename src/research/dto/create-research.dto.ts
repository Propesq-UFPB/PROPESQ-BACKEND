import { OmitType } from '@nestjs/swagger';
import { Research } from '../entities/research.entity';

export class CreateResearchDto extends OmitType(Research, ['id'] as const) {}
