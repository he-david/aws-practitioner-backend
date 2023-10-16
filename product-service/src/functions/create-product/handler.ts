import { middyfy } from '@libs/lambda';
import { createProduct } from '../../services/create-product';

export const main = middyfy(createProduct);
