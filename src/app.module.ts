import { Module } from '@nestjs/common';
import { ResearchModule } from './research/research.module';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { AcademicUnitController } from './academic-unit/academic-unit.controller';
import { AcademicUnitService } from './academic-unit/academic-unit.service';
import { AcademicUnitModule } from './academic-unit/academic-unit.module';

@Module({
  imports: [ResearchModule, PrismaModule, UsersModule, AcademicUnitModule],
  controllers: [AcademicUnitController],
  providers: [AcademicUnitService],
})
export class AppModule {}
