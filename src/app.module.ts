import { Module } from '@nestjs/common';
import { ResearchModule } from './research/research.module';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [ResearchModule, PrismaModule, UsersModule],
})
export class AppModule {}
