import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'crypto';

@Injectable()
export class StorageService {
  private readonly s3: S3Client;
  private readonly bucket: string;
  private readonly region: string;
  private readonly endpoint: string | undefined;
  private readonly presignExpiresIn: number;

  constructor(private readonly config: ConfigService) {
    this.region = config.getOrThrow<string>('AWS_REGION');
    this.bucket = config.getOrThrow<string>('S3_BUCKET');
    this.endpoint = config.get<string>('AWS_ENDPOINT');
    this.presignExpiresIn = config.get<number>('PRESIGN_EXPIRES_IN') ?? 86400;

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
      if (error instanceof Error && error.name !== 'NoSuchKey') {
        throw error;
      }
    }
  }

  // Returns a pre-signed GET URL for an S3-stored photo.
  // If the URL does not belong to this bucket (e.g. DiceBear fallback), returns it unchanged.
  async presignUrl(url: string): Promise<string> {
    if (!this.isS3Url(url)) return url;

    const key = this.keyFromUrl(url);
    return getSignedUrl(this.s3, new GetObjectCommand({ Bucket: this.bucket, Key: key }), {
      expiresIn: this.presignExpiresIn,
    });
  }

  // Extracts the S3 object key from a URL previously returned by upload().
  keyFromUrl(url: string): string {
    if (this.endpoint) {
      // Custom endpoint URL format: {endpoint}/{bucket}/{key}
      const base = `${this.endpoint}/${this.bucket}/`;
      return url.startsWith(base) ? url.slice(base.length) : new URL(url).pathname.slice(1);
    }
    // Standard S3 URL format: https://{bucket}.s3.{region}.amazonaws.com/{key}
    return new URL(url).pathname.slice(1);
  }

  private isS3Url(url: string): boolean {
    try {
      const { hostname } = new URL(url);
      if (this.endpoint) {
        return url.startsWith(this.endpoint);
      }
      return hostname.endsWith('.amazonaws.com');
    } catch {
      return false;
    }
  }

  private buildUrl(key: string): string {
    if (this.endpoint) {
      return `${this.endpoint}/${this.bucket}/${key}`;
    }
    return `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`;
  }
}
