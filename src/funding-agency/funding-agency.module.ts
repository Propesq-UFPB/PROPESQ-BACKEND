import { Module } from '@nestjs/common';
import { FundingAgencyController } from './funding-agency.controller';
import { FundingAgencyService } from './funding-agency.service';

@Module({
  controllers: [FundingAgencyController],
  providers: [FundingAgencyService],
  exports: [FundingAgencyService],
})
export class FundingAgencyModule {}
