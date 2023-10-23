import { middyfy } from '@libs/lambda';
import { importProductsFile } from '../../services/import-products-file';

export const main = middyfy(importProductsFile);
