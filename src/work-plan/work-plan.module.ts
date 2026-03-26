import { Module } from '@nestjs/common';
import { WorkPlanController } from './work-plan.controller';
import { WorkPlanService } from './work-plan.service';

@Module({
  controllers: [WorkPlanController],
  providers: [WorkPlanService],
  exports: [WorkPlanService],
})
export class WorkPlanModule {}
