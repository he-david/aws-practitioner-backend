import { APIGatewayAuthorizerResult, APIGatewayTokenAuthorizerEvent, PolicyDocument } from 'aws-lambda';

enum Effect {
  Allow = 'Allow',
  Deny = 'Deny',
}

const generatePolicyDocument = (effect: Effect, resource: string): PolicyDocument => {
  return {
    Version: '2012-10-17',
    Statement: [
      {
        Action: 'execute-api:Invoke',
        Effect: effect,
        Resource: resource,
      },
    ],
  };
};

const generateResponse = (principalId: string, effect: Effect, resource: string): APIGatewayAuthorizerResult => {
  return {
    principalId,
    policyDocument: generatePolicyDocument(effect, resource),
  };
};

const decodeToken = (authorizationToken: string): { username: string; password: string } => {
  const [username, password] = Buffer.from(authorizationToken.replace('Basic ', ''), 'base64').toString('ascii').split(':');
  return { username, password };
};

export const basicAuthorizer = async (event: APIGatewayTokenAuthorizerEvent): Promise<APIGatewayAuthorizerResult> => {
  const { methodArn, authorizationToken } = event;
  console.log('Event: ', event);
  const { username, password } = decodeToken(authorizationToken);
  const principalId = username;

  const result =
    username === 'hedavid' && password === process.env.hedavid
      ? generateResponse(principalId, Effect.Allow, methodArn)
      : generateResponse(principalId, Effect.Deny, methodArn);

  console.log('Result: ', JSON.stringify(result));
  return result;
};
