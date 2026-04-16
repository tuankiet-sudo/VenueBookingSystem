import { Module } from '@nestjs/common';
import { UserService } from './services/user.service';
import { UserController } from './user.controller';
import { DatabaseModule } from '../database/database.module';
import { ClientService, OwnerService } from './services';
import { forwardRef } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [forwardRef(() => AuthModule), DatabaseModule],
  controllers: [UserController],
  providers: [UserService, ClientService, OwnerService],
  exports: [UserService, ClientService, OwnerService],
})
export class UserModule {}
