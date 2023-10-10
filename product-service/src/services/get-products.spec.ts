import * as formatters from '@libs/api-gateway';
import { getProductsList } from './get-products';
import { products } from '../mocks/products.mock';

const formatJSONResponseSpy = jest.spyOn(formatters, 'formatJSONResponse');

describe('GetProducts', () => {
  it('should call formatJSONResponse with received products', async () => {
    await getProductsList(null, null, jest.fn());
    expect(formatJSONResponseSpy).toBeCalledWith({ products: products });
  });
});
