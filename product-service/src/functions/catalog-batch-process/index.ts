import { handlerPath } from '@libs/handler-resolver';

export default {
  handler: `${handlerPath(__dirname)}/handler.main`,
  events: [
    {
      sqs: {
        arn: {
          'Fn::GetAtt': ['CatalogItemsSQS', 'Arn'],
        },
        batchSize: 5,
      },
    },
  ],
};
