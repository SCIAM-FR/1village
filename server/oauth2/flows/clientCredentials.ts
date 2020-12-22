import { JSONSchemaType } from "ajv";
import { Request, Response } from "express";

import { AppError, ErrorCode } from "../../middlewares/handleErrors";
import { ajv, sendInvalidDataError } from "../../utils/jsonSchemaValidator";
import { getAccessToken } from "../lib/tokens";

type TokenParams = {
  grant_type: "client_credentials";
  client_id?: string;
  client_secret?: string;
  scope?: string;
};
const TOKEN_SCHEMA: JSONSchemaType<TokenParams> = {
  type: "object",
  properties: {
    grant_type: { type: "string", const: "client_credentials" },
    client_id: { type: "string", nullable: true },
    client_secret: { type: "string", nullable: true },
    scope: { type: "string", nullable: true },
  },
  required: ["grant_type"],
  additionalProperties: false,
};
const tokenValidator = ajv.compile(TOKEN_SCHEMA);
export async function clientCredentials(data: unknown, req: Request, res: Response): Promise<void> {
  if (!tokenValidator(data)) {
    sendInvalidDataError(tokenValidator);
    return;
  }

  if (!req.appClient) {
    throw new AppError("unauthorized_client", ErrorCode.UNKNOWN);
  }

  // Grant access
  const { accessToken } = await getAccessToken(-1, false);
  res.sendJSON({
    access_token: accessToken,
    token_type: "Bearer",
    expires_in: 3600,
  });
}
