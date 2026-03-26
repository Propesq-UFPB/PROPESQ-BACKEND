import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ResearchModule } from './research/research.module';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { WorkPlanModule } from './work-plan/work-plan.module';
import { AcademicUnitModule } from './academic-unit/academic-unit.module';

@Module({
  imports: [
    AcademicUnitModule,
    AuthModule,
    PrismaModule,
    ResearchModule,
    UsersModule,
    WorkPlanModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
