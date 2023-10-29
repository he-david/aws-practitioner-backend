import { DynamoDBClient, TransactWriteItemsCommand } from '@aws-sdk/client-dynamodb';
import { catalogBatchProcess } from './catalog-batch-process';
import { SQSEvent } from 'aws-lambda';
import { mockClient } from 'aws-sdk-client-mock';
import { PublishCommand, SNSClient } from '@aws-sdk/client-sns';

const mockDBClient = mockClient(DynamoDBClient);
const mockSNSClient = mockClient(SNSClient);

describe('catalogBatchProcess', () => {
  const mockEvent = {
    Records: [
      {
        body: JSON.stringify({
          title: 'Product 1',
          description: 'Description 1',
          price: 10,
          count: 50,
        }),
      },
      {
        body: JSON.stringify({
          title: 'Product 2',
          description: 'Description 2',
          price: 20,
          count: 60,
        }),
      },
    ],
  };

  const mockPromiseAll = jest.fn();
  const realPromiseAll = Promise.all;

  const mockConsoleError = jest.fn();
  const realConsoleError = console.error;

  beforeEach(() => {
    mockDBClient.on(TransactWriteItemsCommand).resolves({});
    mockSNSClient.on(PublishCommand).resolves({});
    console.error = mockConsoleError;
  });

  afterEach(() => {
    jest.clearAllMocks();
    Promise.all = realPromiseAll;
    console.error = realConsoleError;
  });

  it('should process SQS event records without error', async () => {
    Promise.all = mockPromiseAll;
    await catalogBatchProcess(mockEvent as SQSEvent, null, () => {});

    expect(mockPromiseAll).toBeCalled();
    expect(mockConsoleError).toBeCalledTimes(0);
  });

  it('should call createTransaction with correct products', async () => {
    mockSNSClient.on(PublishCommand).rejects();
    await catalogBatchProcess(mockEvent as SQSEvent, null, () => {});

    expect(mockConsoleError).toBeCalledWith('Error happened during product creation', '');
  });
});
