import { Module } from '@nestjs/common';
import { AcademicUnitsController } from './academic-unit.controller';
import { AcademicUnitService } from './academic-unit.service';

@Module({
  controllers: [AcademicUnitsController],
  providers: [AcademicUnitService],
})
export class AcademicUnitModule {}
