import { Body, Controller, Injectable, Post, UseGuards } from '@nestjs/common';
import { MinioStorageService } from './services/minio-storage.service';
import { AuthGuard } from 'src/auth/guards';

@Injectable()
@Controller('storage')
export class MinioStorageController {
  constructor(private readonly minioStorageService: MinioStorageService) {}

  @Post('')
  @UseGuards(AuthGuard)
  public async getPresignedUrl(@Body() body: { key: string }) {
    const url = await this.minioStorageService.getPresignedUploadUrl(
      'booking-classroom-assets',
      `booking-database/${body.key}`,
    );
    return { url };
  }
}
