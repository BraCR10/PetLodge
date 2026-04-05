import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DeleteObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';

@Injectable()
export class StorageService {
  private readonly s3: S3Client;
  private readonly bucket: string;
  private readonly region: string;
  private readonly endpoint: string | undefined;

  constructor(private readonly config: ConfigService) {
    this.region = config.getOrThrow<string>('AWS_REGION');
    this.bucket = config.getOrThrow<string>('S3_BUCKET');
    this.endpoint = config.get<string>('AWS_ENDPOINT');

    this.s3 = new S3Client({
      region: this.region,
      credentials: {
        accessKeyId: config.getOrThrow<string>('S3_ID'),
        secretAccessKey: config.getOrThrow<string>('S3_SECRET_KEY'),
      },
      ...(this.endpoint && { endpoint: this.endpoint }),
    });
  }

  async upload(buffer: Buffer, mimetype: string, filename: string): Promise<string> {
    const key = `${randomUUID()}-${filename}`;

    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: buffer,
        ContentType: mimetype,
      }),
    );

    return this.buildUrl(key);
  }

  async delete(key: string): Promise<void> {
    try {
      await this.s3.send(
        new DeleteObjectCommand({
          Bucket: this.bucket,
          Key: key,
        }),
      );
    } catch (error) {
      // Ignore NoSuchKey errors; file may have been deleted already
      if (error instanceof Error && error.name !== 'NoSuchKey') {
        throw error;
      }
    }
  }

  // Extracts the S3 object key from a URL previously returned by upload().
  keyFromUrl(url: string): string {
    const pathname = new URL(url).pathname.slice(1);
    if (this.endpoint) {
      // Custom endpoint URL format: {endpoint}/{bucket}/{key}
      return pathname.slice(this.bucket.length + 1);
    }
    // Standard S3 URL format: https://{bucket}.s3.{region}.amazonaws.com/{key}
    return pathname;
  }

  private buildUrl(key: string): string {
    if (this.endpoint) {
      return `${this.endpoint}/${this.bucket}/${key}`;
    }
    return `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`;
  }
}
