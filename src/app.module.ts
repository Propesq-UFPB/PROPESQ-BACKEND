import { Module } from '@nestjs/common';
import { ResearchModule } from './research/research.module';

@Module({
  imports: [ResearchModule],
})
export class AppModule {}
