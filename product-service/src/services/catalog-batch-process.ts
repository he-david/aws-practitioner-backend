import { SQSEvent, SQSHandler } from 'aws-lambda';
import { ProductWithStock } from '../models';
import { v4 as uuidv4 } from 'uuid';
import { DynamoDBClient, TransactWriteItemsCommand } from '@aws-sdk/client-dynamodb';
import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';

const productsTable = process.env.TABLE_NAME;
const stockTable = process.env.STOCK_TABLE_NAME;
const snsArn = process.env.SNS_TOPIC_ARN;
const dbclient = new DynamoDBClient({ region: 'us-east-1' });
const snsClient = new SNSClient({ region: 'us-east-1' });

const createTransaction = (productWithStock: ProductWithStock) => {
  return dbclient.send(
    new TransactWriteItemsCommand({
      TransactItems: [
        {
          Put: {
            TableName: productsTable,
            Item: {
              id: { S: productWithStock.id },
              title: { S: productWithStock.title },
              description: { S: productWithStock.description },
              price: { N: productWithStock.price.toString() },
            },
          },
        },
        {
          Put: {
            TableName: stockTable,
            Item: {
              id: { S: productWithStock.stockId },
              productId: { S: productWithStock.id },
              count: { N: productWithStock.count.toString() },
            },
          },
        },
      ],
    })
  );
};

const publishTopic = (product: ProductWithStock) => {
  return snsClient.send(
    new PublishCommand({
      TargetArn: snsArn,
      Message: `Product created: ${JSON.stringify(product)}`,
      Subject: 'Product created',
      MessageAttributes: {
        amount: {
          DataType: 'String',
          StringValue: product.count > 50 ? 'Big' : 'Small',
        },
      },
    })
  );
};

export const catalogBatchProcess: SQSHandler = async (event: SQSEvent): Promise<void> => {
  const transactions = [];
  let publications = [];
  const createdProducts = [];

  event.Records.forEach((record) => {
    const productWithStock = JSON.parse(record.body) as ProductWithStock;
    productWithStock.id = uuidv4();
    productWithStock.stockId = uuidv4();
    transactions.push(createTransaction(productWithStock));
    createdProducts.push(productWithStock);
    publications.push(publishTopic(productWithStock));
  });
  try {
    await Promise.all([...transactions, ...publications]);
  } catch (err) {
    console.error('Error happened during product creation', err.message);
  }
};
