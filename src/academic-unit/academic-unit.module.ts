import { Module } from '@nestjs/common';
import { AcademicUnitController } from './academic-unit.controller';
import { AcademicUnitService } from './academic-unit.service';

@Module({
  controllers: [AcademicUnitController],
  providers: [AcademicUnitService]
})
export class AcademicUnitModule {}
