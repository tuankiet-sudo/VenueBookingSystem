import { Module } from '@nestjs/common';
import { DatabaseService } from './database.service';
import { commonConfig, CommonConfigType } from '../config';
import * as mysql from 'mysql2/promise';

@Module({
  providers: [
    {
      provide: 'DATABASE_POOL',
      useFactory: (appCommonConfig: CommonConfigType) => {
        return mysql.createPool({
          host: appCommonConfig.dbHost,
          user: appCommonConfig.dbUser,
          database: appCommonConfig.dbName,
          password: appCommonConfig.dbPassword,
          port: appCommonConfig.dbPort,
          compress: false,
          waitForConnections: true,
          connectionLimit: 10,
          maxIdle: 10, // max idle connections, the default value is the same as `connectionLimit`
          idleTimeout: 60000, // idle connections timeout, in milliseconds, the default value 60000
          queueLimit: 0,
          enableKeepAlive: true,
          keepAliveInitialDelay: 0,
          timezone: '+07:00', // Ép thư viện mysql2 tự động chuyển ngày giờ sang giờ VN
          dateStrings: true, // Báo cho mysql2 biết hãy trả về string ngày giờ nguyên bản, đừng để Node.js UTC ép kiểu lại
        });
      },
      inject: [commonConfig.KEY],
    },
    DatabaseService,
  ],
  exports: [DatabaseService],
})
export class DatabaseModule {}
