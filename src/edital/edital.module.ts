import { Module } from '@nestjs/common';
import { EditalService } from './edital.service';
import { EditalController } from './edital.controller';

@Module({
  providers: [EditalService],
  controllers: [EditalController],
})
export class EditalModule {}
