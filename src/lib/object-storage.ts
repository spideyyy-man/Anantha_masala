import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const BUCKET = 'assets';

function createStorageClient(): S3Client {
  const required = ['AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY', 'AWS_ENDPOINT_URL_S3', 'AWS_REGION'] as const;
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length) {
    throw new Error(`Neon Object Storage is not configured. Missing: ${missing.join(', ')}`);
  }

  return new S3Client({
    endpoint: process.env.AWS_ENDPOINT_URL_S3,
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
    forcePathStyle: true,
  });
}

let client: S3Client | undefined;
function getStorageClient(): S3Client {
  client ??= createStorageClient();
  return client;
}

export async function uploadPrivateAsset(
  key: string,
  body: Buffer | Uint8Array,
  contentType: string,
): Promise<void> {
  await getStorageClient().send(new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    Body: body,
    ContentType: contentType,
    CacheControl: 'private, no-store',
  }));
}

export async function downloadPrivateAsset(key: string): Promise<Uint8Array> {
  const response = await getStorageClient().send(new GetObjectCommand({ Bucket: BUCKET, Key: key }));
  if (!response.Body) throw new Error(`Object storage returned an empty body for ${key}`);
  return response.Body.transformToByteArray();
}

export async function deletePrivateAsset(key: string): Promise<void> {
  await getStorageClient().send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
}

export async function createPrivateAssetDownloadUrl(key: string, expiresIn = 900): Promise<string> {
  if (!Number.isInteger(expiresIn) || expiresIn < 1 || expiresIn > 3600) {
    throw new Error('Presigned URL expiry must be between 1 and 3600 seconds.');
  }
  return getSignedUrl(
    getStorageClient(),
    new GetObjectCommand({ Bucket: BUCKET, Key: key }),
    { expiresIn },
  );
}
