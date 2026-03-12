import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { ConfigModule } from '@nestjs/config';
import { commonConfig } from './config';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { VenueModule } from './venue/venue.module';
import { OrderModule } from './order/order.module';
import { PaymentModule } from './payment/payment.module';
import { StorageModule } from './storage/storage.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [commonConfig],
    }),
    DatabaseModule,
    AuthModule,
    UserModule,
    VenueModule,
    OrderModule,
    PaymentModule,
    StorageModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
