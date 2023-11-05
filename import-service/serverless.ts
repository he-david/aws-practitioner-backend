import type { AWS } from '@serverless/typescript';
import importProductsFile from '@functions/import-products-file';
import importFileParser from '@functions/import-file-parser';

const serverlessConfiguration: AWS = {
  service: 'import-service',
  frameworkVersion: '3',
  plugins: ['serverless-esbuild'],
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
      BUCKET_NAME: '${self:custom.bucketName}',
    },
    iamRoleStatements: [
      {
        Effect: 'Allow',
        Action: ['s3:PutObject', 's3:PutObjectTagging', 's3:GetObject', 's3:GetObjectTagging', 's3:DeleteObject'],
        Resource: 'arn:aws:s3:::${self:custom.bucketName}/*',
      },
      {
        Effect: 'Allow',
        Action: ['sqs:SendMessage'],
        Resource: 'arn:aws:sqs:us-east-1:858350789047:catalogItemsQueue',
      },
    ],
  },
  resources: {
    Resources: {
      ImportProductsBucket: {
        Type: 'AWS::S3::Bucket',
        Properties: {
          BucketName: '${self:custom.bucketName}',
          CorsConfiguration: {
            CorsRules: [
              {
                AllowedOrigins: ['*'],
                AllowedHeaders: ['*'],
                AllowedMethods: ['PUT'],
              },
            ],
          },
        },
      },
      GatewayResponseDefault4XX: {
        Type: 'AWS::ApiGateway::GatewayResponse',
        Properties: {
          ResponseParameters: {
            'gatewayresponse.header.Access-Control-Allow-Origin': "'*'",
            'gatewayresponse.header.Access-Control-Allow-Headers': "'*'",
          },
          ResponseType: 'DEFAULT_4XX',
          RestApiId: {
            Ref: 'ApiGatewayRestApi',
          },
        },
      },
    },
  },
  // import the function via paths
  functions: { importProductsFile, importFileParser },
  package: { individually: true },
  custom: {
    esbuild: {
      bundle: true,
      minify: false,
      sourcemap: true,
      exclude: ['aws-sdk'],
      target: 'node18',
      define: { 'require.resolve': undefined },
      platform: 'node',
      concurrency: 5,
    },
    bucketName: 'upload-products-bucket',
  },
};

module.exports = serverlessConfiguration;
