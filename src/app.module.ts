import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ResearchModule } from './research/research.module';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { WorkPlanModule } from './work-plan/work-plan.module';
import { AcademicUnitModule } from './academic-unit/academic-unit.module';
import { DepartmentModule } from './department/department.module';
import { EditalModule } from './edital/edital.module';
import { CotaBolsaModule } from './cota_bolsa/cota_bolsa.module';
import { ScholarshipModule } from './scholarship/scholarship.module';
import { CategoryModule } from './category/category.module';
import { EvaluationCriteriaModule } from './evaluation-criteria/evaluation-criteria.module';
import { ResearchEvaluationModule } from './research-evaluation/research-evaluation.module';
import { DistribuicaoModule } from './distribuicao/distribuicao.module';
import { FundingAgencyModule } from './funding-agency/funding-agency.module';
import { UserTypeModule } from './user-type/user-type.module';
import { ProjectRolesModule } from './project-roles/project-roles.module';
import { ProjectMembersModule } from './project-members/project-members.module';
import { ReportsModule } from './reports/reports.module';
import { CertificatesModule } from './certificates/certificates.module';
import { DashboardModule } from './dashboard/dashboard.module';

@Module({
  imports: [
    AcademicUnitModule,
    DepartmentModule,
    AuthModule,
    PrismaModule,
    ResearchModule,
    UsersModule,
    WorkPlanModule,
    EditalModule,
    CotaBolsaModule,
    ScholarshipModule,
    CategoryModule,
    EvaluationCriteriaModule,
    ResearchEvaluationModule,
    DistribuicaoModule,
    FundingAgencyModule,
    ProjectRolesModule,
    UserTypeModule,
    ProjectMembersModule,
    ReportsModule,
    CertificatesModule,
    DashboardModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
