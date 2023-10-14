import * as formatters from '@libs/api-gateway';
import { products } from '../mocks/products.mock';
import { getProductsById } from './get-products-by-id';

const formatJSONResponseSpy = jest.spyOn(formatters, 'formatJSONResponse');
const formatErrorResponseSpy = jest.spyOn(formatters, 'formatErrorResponse');

describe('GetProductById', () => {
  let event;

  beforeEach(() => {
    event = {
      pathParameters: {},
    };
  });

  it('should call formatJSONResponse with filtered product', async () => {
    event.pathParameters.productId = products[0].id;

    await getProductsById(event, null, jest.fn());
    expect(formatJSONResponseSpy).toBeCalledWith({ product: products[0] });
  });

  it('should call formatErrorRespose with 404 status code', async () => {
    event.pathParameters.productId = 'invalidId';

    await getProductsById(event, null, jest.fn());
    expect(formatErrorResponseSpy).toBeCalledWith(new Error('Product not found'), 404);
  });
});
