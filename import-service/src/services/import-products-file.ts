import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import schema from '@functions/import-products-file/schema';
import { ValidatedEventAPIGatewayProxyEvent, formatErrorResponse, formatJSONResponse } from '@libs/api-gateway';

const bucketName = process.env.BUCKET_NAME;

export const importProductsFile: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
  const client = new S3Client({ region: 'us-east-1' });
  const fileName = event.queryStringParameters.name;

  if (!fileName || !fileName.endsWith('.csv')) {
    return formatErrorResponse(new Error('Invalid fileName in path.'), 400);
  }
  const url = await getSignedUrl(client, new PutObjectCommand({ Bucket: bucketName, Key: `uploaded/${fileName}` }), { expiresIn: 3600 });
  return formatJSONResponse({ url });
};
