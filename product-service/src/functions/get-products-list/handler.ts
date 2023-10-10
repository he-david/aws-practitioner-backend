import { middyfy } from '@libs/lambda';
import { getProductsList } from 'src/services/get-products';

export const main = middyfy(getProductsList);
