import { APIGatewayProxyEvent } from "aws-lambda";
import { getValidAuthorizerKeys } from "./ssmUtils";

export interface AuthorizerResponse {
  isAuthorized: boolean;
  context?: {
    email: string;
  };
}

type BasicAuthEvent = Pick<APIGatewayProxyEvent, "body" | "headers">;

/**
 * This authorizer succeeds when:
 *  - The event contains a header which contains a Basic Authorization entry
 *  - The value in that basic authorization header is present in the output of
 *    `getValidAuthorizerKeys`
 *  - The event contains a URL-encoded body which contains an email-key
 *  - The email value is a non-empty string
 *
 * @param event Should have a basic Authorization header and a URLSearchParams
 * body containing an email key
 */
export const basicAuthHandler = async (
  event: BasicAuthEvent,
): Promise<AuthorizerResponse> => {
  if (event.body == null || Object.keys(event.headers).length === 0) {
    return { isAuthorized: false };
  }

  const authHeader = event.headers.Authorization ?? event.headers.authorization;
  if (authHeader == undefined || authHeader.length === 0) {
    return { isAuthorized: false };
  }

  const authHeaderKey = authHeader.replace(/^Basic /, "");
  const validAuthorizationKeys = await getValidAuthorizerKeys();
  if (!validAuthorizationKeys.includes(authHeaderKey)) {
    return { isAuthorized: false };
  }

  const params = new URLSearchParams(event.body);
  const email = params.get("email");
  if (email == null || email.length === 0) {
    return { isAuthorized: false };
  }

  return {
    isAuthorized: true,
    context: { email },
  };
};
