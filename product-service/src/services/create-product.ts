import { DynamoDBClient, TransactWriteItemsCommand } from '@aws-sdk/client-dynamodb';
import schema from '@functions/create-product/schema';
import { ValidatedEventAPIGatewayProxyEvent, formatErrorResponse, formatJSONResponse } from '@libs/api-gateway';
import { v4 as uuidv4 } from 'uuid';

const productsTable = process.env.TABLE_NAME;
const stockTable = process.env.STOCK_TABLE_NAME;

export const createProduct: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
  try {
    console.log('Crete product requested with', event.body);
    const dbclient = new DynamoDBClient({ region: 'us-east-1' });
    const productId = uuidv4();
    const stockId = uuidv4();

    await dbclient.send(
      new TransactWriteItemsCommand({
        TransactItems: [
          {
            Put: {
              TableName: productsTable,
              Item: {
                id: { S: productId },
                title: { S: event.body.title },
                description: { S: event.body.description },
                price: { N: event.body.price.toString() },
              },
            },
          },
          {
            Put: {
              TableName: stockTable,
              Item: {
                id: { S: stockId },
                productId: { S: productId },
                count: { N: event.body.count.toString() },
              },
            },
          },
        ],
      })
    );

    return formatJSONResponse(
      {
        message: 'Product created',
      },
      201
    );
  } catch (err) {
    return formatErrorResponse(err, 500);
  }
};
