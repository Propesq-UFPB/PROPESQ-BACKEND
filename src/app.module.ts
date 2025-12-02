import { Module } from '@nestjs/common';
import { ResearchModule } from './research/research.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [ResearchModule, PrismaModule]
})
export class AppModule {}
