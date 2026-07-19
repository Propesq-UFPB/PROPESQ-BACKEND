import { Module } from '@nestjs/common';
import { ProjectRolesController } from './project-roles.controller';
import { ProjectRolesService } from './project-roles.service';

@Module({
  controllers: [ProjectRolesController],
  providers: [ProjectRolesService],
  exports: [ProjectRolesService],
})
export class ProjectRolesModule {}
