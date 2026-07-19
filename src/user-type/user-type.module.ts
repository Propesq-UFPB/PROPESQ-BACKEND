import { Module } from '@nestjs/common';
import { UserTypeController } from './user-type.controller';
import { UserTypeService } from './user-type.service';

@Module({
  controllers: [UserTypeController],
  providers: [UserTypeService],
})
export class UserTypeModule {}
