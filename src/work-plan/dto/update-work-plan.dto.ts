import { PartialType } from '@nestjs/swagger';
import { WorkPlanCreationDto } from './create-work-plan.dto';

export class WorkPlanUpdateDto extends PartialType(WorkPlanCreationDto) {}
