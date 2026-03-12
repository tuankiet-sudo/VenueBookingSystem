import {
  Injectable,
  InternalServerErrorException,
  Inject,
} from '@nestjs/common';
import * as minio from 'minio';
import { Readable } from 'node:stream';

@Injectable()
export class MinioStorageService {
  private readonly minioClient: minio.Client;

  constructor(@Inject(minio.Client) minioClient: minio.Client) {
    this.minioClient = minioClient;
  }

  public async getPresignedUploadUrl(
    bucket: string,
    key: string,
    expires = 300,
  ): Promise<string> {
    try {
      await this.ensureBucketExist(bucket);
      return await this.minioClient.presignedPutObject(bucket, key, expires);
    } catch (error: any) {
      throw new InternalServerErrorException(
        `Failed to get presigned upload URL: ${error.message}`,
      );
    }
  }

  public async getDownloadStream(
    bucket: string,
    key: string,
  ): Promise<Readable> {
    try {
      await this.ensureBucketExist(bucket);
      const stream = await this.minioClient.getObject(bucket, key);
      return stream;
    } catch (error: any) {
      throw new InternalServerErrorException(
        `Failed to download file: ${error.message}`,
      );
    }
  }

  public async getLinkToDownload(
    bucket: string,
    key: string,
    expires = 300,
  ): Promise<string> {
    await this.ensureBucketExist(bucket);
    return this.minioClient.presignedGetObject(bucket, key, expires);
  }

  public async deleteObject(bucket: string, key: string): Promise<void> {
    try {
      await this.minioClient.removeObject(bucket, key);
    } catch (error: any) {
      throw new InternalServerErrorException(
        `Failed to delete object: ${error.message}`,
      );
    }
  }

  public async putObject(
    file: Express.Multer.File,
    bucket: string,
    key: string,
  ): Promise<void> {
    try {
      await this.minioClient.putObject(bucket, key, file.buffer, file.size);
    } catch (error: any) {
      throw new InternalServerErrorException(
        `Failed to put object: ${error.message}`,
      );
    }
  }

  private async ensureBucketExist(bucket: string): Promise<void> {
    try {
      const bucketExists = await this.minioClient.bucketExists(bucket);
      if (!bucketExists) {
        await this.minioClient.makeBucket(bucket);
      }
    } catch {
      throw new InternalServerErrorException(
        `Bucket ${bucket} doesn't exists!`,
      );
    }
  }
}
