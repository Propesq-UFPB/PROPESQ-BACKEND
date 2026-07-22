import { Module } from '@nestjs/common';
import { ResearchModuleParametersController } from './research-module-parameters.controller';
import { ResearchModuleParametersService } from './research-module-parameters.service';

@Module({
  controllers: [ResearchModuleParametersController],
  providers: [ResearchModuleParametersService],
  exports: [ResearchModuleParametersService],
})
export class ResearchModuleParametersModule {}
