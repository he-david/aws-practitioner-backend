import { middyfy } from '@libs/lambda';
import { getProductsById } from 'src/services/get-products-by-id';

export const main = middyfy(getProductsById);
