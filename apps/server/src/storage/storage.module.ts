import { Module } from '@nestjs/common';
import * as minio from 'minio';

import { MinioStorageService } from './services/minio-storage.service';
import { commonConfig, CommonConfigType } from 'src/config';
import { MinioStorageController } from './storage.controller';
import { DatabaseModule } from 'src/database/database.module';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [DatabaseModule, UserModule],
  controllers: [MinioStorageController],
  providers: [
    MinioStorageService,
    {
      provide: minio.Client,
      useFactory: (appCommonConfig: CommonConfigType): minio.Client | null => {
        const client = new minio.Client({
          endPoint: appCommonConfig.minioEndPoint,
          port: appCommonConfig.minioPort,
          accessKey: appCommonConfig.minioAccessKey,
          useSSL: appCommonConfig.minioUseSSL,
          secretKey: appCommonConfig.minioSecretKey,
        });

        return client;
      },
      inject: [commonConfig.KEY],
    },
  ],
  exports: [MinioStorageService],
})
export class StorageModule {}
