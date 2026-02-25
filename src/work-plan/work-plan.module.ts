import { Module } from '@nestjs/common';
import { WorkPlanService } from './work-plan.service';
import { WorkPlanController } from './work-plan.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [WorkPlanController],
  providers: [WorkPlanService],
  exports: [WorkPlanService],
})
export class WorkPlanModule {}
