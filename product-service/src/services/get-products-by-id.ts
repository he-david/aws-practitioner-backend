import schema from '@functions/get-products-by-id/schema';
import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { formatErrorResponse, formatJSONResponse } from '@libs/api-gateway';
import { products } from '../mocks/products.mock';

export const getProductsById: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
  const productId = event.pathParameters.productId;
  const product = await Promise.resolve(products.find((product) => product.id === productId));

  return product ? formatJSONResponse({ product }) : formatErrorResponse(new Error('Product not found'), 404);
};
