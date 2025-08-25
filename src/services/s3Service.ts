import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';

const s3 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY as string,
  },
});

export const uploadToS3 = async (key: string, body: Buffer | string, contentType: string) => {
  const params = {
    Bucket: process.env.R2_BUCKET as string,
    Key: key,
    Body: body,
    ContentType: contentType,
  };
  return s3.send(new PutObjectCommand(params));
};

export const getObjectFromS3 = async (key: string) => {
  const params = {
    Bucket: process.env.R2_BUCKET as string,
    Key: key,
  };
  return s3.send(new GetObjectCommand(params));
};

export const getPublicUrl = (key: string) => {
  return `${process.env.R2_PUBLIC_URL}/${key}`;
};