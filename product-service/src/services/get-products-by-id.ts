import schema from '@functions/get-products-by-id/schema';
import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { formatErrorResponse, formatJSONResponse } from '@libs/api-gateway';
import { DynamoDBClient, ScanCommand } from '@aws-sdk/client-dynamodb';
import { formatDBResult } from '../helpers/format-db-result';
import { Stock, Product } from '../models';

const productsTable = process.env.TABLE_NAME;
const stockTable = process.env.STOCK_TABLE_NAME;

export const getProductsById: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
  try {
    console.log('Get products by id requested with', event.pathParameters);
    const dbclient = new DynamoDBClient({ region: 'us-east-1' });
    const productId = event.pathParameters.productId;

    if (!productId) {
      return formatErrorResponse(new Error('No product id provided'), 400);
    }
    const [productOutput, stockOutput] = await Promise.all([
      dbclient.send(
        new ScanCommand({
          TableName: productsTable,
          FilterExpression: 'id = :productId',
          ExpressionAttributeValues: {
            ':productId': { S: productId },
          },
        })
      ),
      dbclient.send(
        new ScanCommand({
          TableName: stockTable,
          FilterExpression: 'productId = :id',
          ExpressionAttributeValues: {
            ':id': { S: productId },
          },
        })
      ),
    ]);

    if (productOutput.Items.length === 0 || stockOutput.Items.length === 0) {
      return formatErrorResponse(new Error('Product not found'), 404);
    }
    const product = formatDBResult(productOutput)[0] as Product;
    const stock = formatDBResult(stockOutput)[0] as Stock;

    return formatJSONResponse({ product: { count: stock.count, ...product } });
  } catch (err) {
    return formatErrorResponse(err, 500);
  }
};
