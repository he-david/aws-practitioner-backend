import { handlerPath } from '@libs/handler-resolver';

export default {
  handler: `${handlerPath(__dirname)}/handler.main`,
  events: [
    {
      http: {
        method: 'get',
        path: '/products/{productId}',
        request: { parameters: { paths: { productId: { required: true } } } },
        cors: true,
      },
    },
  ],
};
