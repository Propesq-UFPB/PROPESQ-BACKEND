import { PartialType } from '@nestjs/swagger';
import { CreateResearchDto } from './create-research.dto';

export class UpdateResearchDto extends PartialType(CreateResearchDto) {}
