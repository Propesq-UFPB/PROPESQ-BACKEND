import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ResearchModule } from './research/research.module';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { SchedulesModule } from './schedules/schedules.module';
import { WorkPlanModule } from './work-plan/work-plan.module';

@Module({
  imports: [
    ResearchModule,
    PrismaModule,
    UsersModule,
    AuthModule,
    SchedulesModule,
    WorkPlanModule,
    ResearchModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
