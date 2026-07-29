import { Global, Module } from '@nestjs/common';
import { ProjectMembershipScopeService } from './project-membership-scope.service';

@Global()
@Module({
  providers: [ProjectMembershipScopeService],
  exports: [ProjectMembershipScopeService],
})
export class ProjectMembershipModule {}
