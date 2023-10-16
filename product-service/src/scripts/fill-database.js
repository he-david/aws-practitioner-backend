const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

AWS.config.update({ region: 'us-east-1' });

const SIZE = 10;
const PRODUCTS_TABLE = 'products-table';
const STOCK_TABLE = 'stock-table';
const documentClient = new AWS.DynamoDB.DocumentClient();

const createProduct = (id, index) => {
  return documentClient
    .put({
      TableName: PRODUCTS_TABLE,
      Item: {
        id,
        title: `test-${index}`,
        description: `Test description - ${index}.`,
        price: Math.floor(Math.random() * 200) + 100,
      },
    })
    .promise();
};

const createStock = (productId) => {
  return documentClient
    .put({
      TableName: STOCK_TABLE,
      Item: {
        id: uuidv4(),
        productId,
        count: Math.floor(Math.random() * 10),
      },
    })
    .promise();
};

const fillDatabase = async () => {
  const promises = [];

  try {
    Math.random();

    for (let i = 0; i < SIZE; i++) {
      const productId = uuidv4();

      promises.push(createProduct(productId, i));
      promises.push(createStock(productId));
    }

    await Promise.all(promises);

    console.log('Successfully created items in DynamoDB.');
  } catch (err) {
    console.error(err.message);
  }
};

fillDatabase();
