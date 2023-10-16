import schema from '@functions/get-products-list/schema';
import { ValidatedEventAPIGatewayProxyEvent, formatErrorResponse, formatJSONResponse } from '@libs/api-gateway';
import { DynamoDBClient, ScanCommand } from '@aws-sdk/client-dynamodb';
import { Stock, Product } from '../models';
import { formatDBResult } from 'src/helpers/format-db-result';
import { ProductWithStock } from 'src/models/product.model';

const productsTable = process.env.TABLE_NAME;
const stockTable = process.env.STOCK_TABLE_NAME;

const appendStockToProduct = (products: Product[], stocks: Stock[]): ProductWithStock[] => {
  return products.map((product) => ({ count: stocks.find((stock) => stock.productId === product.id)?.count ?? 0, ...product }));
};

export const getProductsList: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async () => {
  try {
    console.log('Get products list requested');
    const dbclient = new DynamoDBClient({ region: 'us-east-1' });

    const [productsOutput, stocksOutput] = await Promise.all([
      dbclient.send(new ScanCommand({ TableName: productsTable })),
      dbclient.send(new ScanCommand({ TableName: stockTable })),
    ]);

    const products = appendStockToProduct(formatDBResult(productsOutput) as Product[], formatDBResult(stocksOutput) as Stock[]);

    return formatJSONResponse({
      products,
    });
  } catch (err) {
    return formatErrorResponse(err, 500);
  }
};
