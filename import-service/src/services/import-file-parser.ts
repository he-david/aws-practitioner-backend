import { CopyObjectCommand, DeleteObjectCommand, GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { SendMessageCommand, SQSClient } from '@aws-sdk/client-sqs';
import { S3Event, S3Handler } from 'aws-lambda';
import csvParser from 'csv-parser';
import { Readable } from 'stream';

const bucketName = process.env.BUCKET_NAME;
const sqsClient = new SQSClient({ region: 'us-east-1' });

const publishSQSEvent = async (data) => {
  sqsClient.send(
    new SendMessageCommand({
      QueueUrl: 'https://sqs.us-east-1.amazonaws.com/858350789047/catalogItemsQueue',
      MessageBody: JSON.stringify(data),
    })
  );
};

const moveFiles = async (client: S3Client, sourceKey: string): Promise<void> => {
  await client.send(
    new CopyObjectCommand({
      Bucket: bucketName,
      CopySource: `${bucketName}/${sourceKey}`,
      Key: `parsed/${sourceKey.substring('uploaded/'.length)}`,
    })
  );

  await client.send(new DeleteObjectCommand({ Bucket: bucketName, Key: sourceKey }));
};

export const importFileParser: S3Handler = async (event: S3Event) => {
  const client = new S3Client({ region: 'us-east-1' });

  for (const record of event.Records) {
    const key = record.s3.object.key;
    const getObjectResponse = await client.send(new GetObjectCommand({ Bucket: bucketName, Key: key }));

    const stream = Readable.from(getObjectResponse.Body);
    stream
      .pipe(csvParser())
      .on('data', (data) => publishSQSEvent(data))
      .on('error', (error) => console.log('Error: ', error))
      .on('end', () => console.log('Stream ended'));

    await moveFiles(client, key);
  }
};
