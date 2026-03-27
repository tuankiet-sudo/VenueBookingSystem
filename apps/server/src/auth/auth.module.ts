import { Global, Module } from '@nestjs/common';
import { AuthService } from './services/auth.service';
import { AuthController } from './auth.controller';
import { DatabaseModule } from 'src/database/database.module';
import { TokenService } from './services';
import { UserModule } from 'src/user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { commonConfig, CommonConfigType } from '../config';

@Global()
@Module({
  imports: [
    JwtModule.registerAsync({
      global: true,
      useFactory: (appCommonConfig: CommonConfigType) => ({
        secret: appCommonConfig.jwtSecret,
        signOptions: { expiresIn: '1y' },
      }),
      inject: [commonConfig.KEY],
    }),
    UserModule,
    DatabaseModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, TokenService],
  exports: [TokenService],
})
export class AuthModule {}
