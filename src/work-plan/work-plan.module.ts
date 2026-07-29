import { Module } from '@nestjs/common';
import { RolesGuard } from '../auth/roles.guard';
import { WorkPlanAccessService } from './work-plan-access.service';
import { WorkPlanController } from './work-plan.controller';
import { WorkPlanService } from './work-plan.service';

@Module({
  controllers: [WorkPlanController],
  providers: [WorkPlanService, WorkPlanAccessService, RolesGuard],
  exports: [WorkPlanService, WorkPlanAccessService],
})
export class WorkPlanModule {}
