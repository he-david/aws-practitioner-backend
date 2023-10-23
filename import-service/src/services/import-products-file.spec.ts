jest.mock('@aws-sdk/s3-request-presigner', () => {
  return {
    getSignedUrl: jest.fn().mockReturnValue('https://example.com'),
  };
});

import * as formatters from '@libs/api-gateway';
import { importProductsFile } from './import-products-file';

const formatJSONResponseSpy = jest.spyOn(formatters, 'formatJSONResponse');
const formatErrorResponseSpy = jest.spyOn(formatters, 'formatErrorResponse');

describe('importProductsFile', () => {
  let mockEvent;
  let mockContext;

  beforeEach(() => {
    mockEvent = {
      queryStringParameters: {
        name: 'example.csv',
      },
    };

    mockContext = {};
  });

  it('should return a signed URL for a valid file name', async () => {
    await importProductsFile(mockEvent, mockContext, null);
    expect(formatJSONResponseSpy).toBeCalledWith({ url: 'https://example.com' });
  });

  it('should return an error response when an invalid file name is provided', async () => {
    mockEvent.queryStringParameters.name = 'invalid.txt';
    await importProductsFile(mockEvent, mockContext, null);
    expect(formatErrorResponseSpy).toBeCalledWith(new Error('Invalid fileName in path.'), 400);
  });
});
