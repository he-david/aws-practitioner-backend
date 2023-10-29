import type { AWS } from '@serverless/typescript';

import getProductsList from '@functions/get-products-list';
import getProductsById from '@functions/get-products-by-id';
import createProduct from '@functions/create-product';
import catalogBatchProcess from '@functions/catalog-batch-process';

const serverlessConfiguration: AWS = {
  service: 'product-service',
  frameworkVersion: '3',
  plugins: ['serverless-auto-swagger', 'serverless-esbuild'],
  provider: {
    name: 'aws',
    runtime: 'nodejs18.x',
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      NODE_OPTIONS: '--enable-source-maps --stack-trace-limit=1000',
      TABLE_NAME: '${self:custom.tableName}',
      STOCK_TABLE_NAME: '${self:custom.stockTableName}',
      SNS_TOPIC_ARN: 'arn:aws:sns:us-east-1:858350789047:createProductTopic',
    },
    iamRoleStatements: [
      {
        Effect: 'Allow',
        Action: ['dynamodb:*'],
        Resource: '*',
      },
      {
        Effect: 'Allow',
        Action: ['sns:Publish'],
        Resource: {
          Ref: 'CreateProductSNS',
        },
      },
    ],
  },
  resources: {
    Resources: {
      ProductsDynamoDB: {
        Type: 'AWS::DynamoDB::Table',
        Properties: {
          TableName: '${self:custom.tableName}',
          AttributeDefinitions: [
            {
              AttributeName: 'id',
              AttributeType: 'S',
            },
          ],
          KeySchema: [
            {
              AttributeName: 'id',
              KeyType: 'HASH',
            },
          ],
          ProvisionedThroughput: {
            ReadCapacityUnits: 5,
            WriteCapacityUnits: 5,
          },
        },
      },
      StockDynamoDB: {
        Type: 'AWS::DynamoDB::Table',
        Properties: {
          TableName: '${self:custom.stockTableName}',
          AttributeDefinitions: [
            {
              AttributeName: 'id',
              AttributeType: 'S',
            },
          ],
          KeySchema: [
            {
              AttributeName: 'id',
              KeyType: 'HASH',
            },
          ],
          ProvisionedThroughput: {
            ReadCapacityUnits: 5,
            WriteCapacityUnits: 5,
          },
        },
      },
      CatalogItemsSQS: {
        Type: 'AWS::SQS::Queue',
        Properties: {
          QueueName: 'catalogItemsQueue',
        },
      },
      CreateProductSNS: {
        Type: 'AWS::SNS::Topic',
        Properties: {
          TopicName: 'createProductTopic',
        },
      },
      EmailSubscriptionSmall: {
        Type: 'AWS::SNS::Subscription',
        Properties: {
          Endpoint: 'hegyidavid2001@gmail.com',
          Protocol: 'email',
          TopicArn: {
            Ref: 'CreateProductSNS',
          },
          FilterPolicy: {
            amount: ['Small'],
          },
        },
      },
      EmailSubscriptionBig: {
        Type: 'AWS::SNS::Subscription',
        Properties: {
          Endpoint: 'dez1dav3@gmail.com',
          Protocol: 'email',
          TopicArn: {
            Ref: 'CreateProductSNS',
          },
          FilterPolicy: {
            amount: ['Big'],
          },
        },
      },
    },
  },
  // import the function via paths
  functions: { getProductsList, getProductsById, createProduct, catalogBatchProcess },
  package: { individually: true },
  custom: {
    esbuild: {
      bundle: true,
      minify: false,
      sourcemap: true,
      exclude: [],
      target: 'node18',
      define: { 'require.resolve': undefined },
      platform: 'node',
      concurrency: 5,
    },
    tableName: 'products-table',
    stockTableName: 'stock-table',
  },
};

module.exports = serverlessConfiguration;
