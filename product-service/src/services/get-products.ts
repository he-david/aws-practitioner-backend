import schema from '@functions/get-products-list/schema';
import { ValidatedEventAPIGatewayProxyEvent, formatJSONResponse } from '@libs/api-gateway';
import { products } from '../mocks/products.mock';

export const getProductsList: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async () => {
  const productList = await Promise.resolve(products);

  return formatJSONResponse({
    products: productList,
  });
};
