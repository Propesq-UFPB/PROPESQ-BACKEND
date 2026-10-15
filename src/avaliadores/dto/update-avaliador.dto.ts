import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateAvaliadorDto } from './create-avaliador.dto';

export class UpdateAvaliadorDto extends PartialType(
  OmitType(CreateAvaliadorDto, ['usuario_id'] as const),
) {}
