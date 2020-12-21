import { JSONSchemaType } from "ajv";
import crypto from "crypto";
import { Response } from "express";

import { ajv, sendInvalidDataError } from "../../utils/jsonSchemaValidator";
import { generateTemporaryPassword, serializeToQueryUrl } from "../../utils";
import { getAccessToken } from "../lib/getAccessToken";

// TODO: DB
type Client = {
  id: string;
  secret: string;
};
export const clients: Client[] = [];
type ClientToken = {
  client_id: string;
  token: string;
  created_at: number;
  redirect_uri: string;
  code_challenge?: string;
  userId: number;
};
export const tokens: ClientToken[] = [];

type AuthorizeParams = {
  response_type: "code";
  client_id: string;
  redirect_uri?: string;
  scope?: string;
  state: string;
  code_challenge_method?: "S256";
  code_challenge?: string;
};
const AUTHORIZE_SCHEMA: JSONSchemaType<AuthorizeParams> = {
  type: "object",
  properties: {
    response_type: { type: "string", const: "code" },
    client_id: { type: "string" },
    redirect_uri: { type: "string", nullable: true },
    scope: { type: "string", nullable: true },
    state: { type: "string", nullable: true },
    code_challenge_method: { type: "string", enum: ["S256"], nullable: true },
    code_challenge: { type: "string", nullable: true },
  },
  required: ["response_type", "client_id", "state"],
  additionalProperties: false,
};
const authorizeValidator = ajv.compile(AUTHORIZE_SCHEMA);
export function codeFlowAuthorize(data: unknown, res: Response): void {
  if (!authorizeValidator(data)) {
    sendInvalidDataError(authorizeValidator);
    return;
  }
  if (!data.redirect_uri) {
    res.redirect("/");
    return;
  }
  // Check client_id
  if (clients.findIndex((c) => c.id === data.client_id) === -1) {
    res.redirect(
      data.redirect_uri +
        serializeToQueryUrl({
          error: "access_denied",
          state: data.state,
        }),
    );
    return;
  }
  // Generate code
  const newToken: ClientToken = {
    client_id: data.client_id,
    created_at: new Date().getTime(),
    token: generateTemporaryPassword(20),
    redirect_uri: data.redirect_uri,
    userId: 12, // TODO
  };
  if (data.code_challenge && data.code_challenge_method === "S256") {
    newToken.code_challenge = data.code_challenge;
  }
  tokens.push(newToken);
  res.redirect(
    data.redirect_uri +
      serializeToQueryUrl({
        code: newToken.token,
        state: data.state,
      }),
  );
}

const isValidChallenge = (challenge: string = "", verifier: string = ""): boolean => {
  if (!challenge || !verifier) {
    return false;
  }
  const hash = crypto.createHash("sha256").update(verifier).digest("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  return hash === challenge;
};

type TokenParams = {
  grant_type: "authorization_code";
  code: string;
  client_id: string;
  client_secret?: string;
  redirect_uri?: string;
  code_verifier?: string;
};
const TOKEN_SCHEMA: JSONSchemaType<TokenParams> = {
  type: "object",
  properties: {
    grant_type: { type: "string", const: "authorization_code" },
    code: { type: "string" },
    client_id: { type: "string" },
    client_secret: { type: "string", nullable: true },
    code_verifier: { type: "string", nullable: true },
    redirect_uri: { type: "string", nullable: true },
  },
  required: ["grant_type", "client_id", "code"],
  additionalProperties: false,
};
const tokenValidator = ajv.compile(TOKEN_SCHEMA);
export function codeFlowToken(data: unknown, res: Response): void {
  if (!tokenValidator(data)) {
    sendInvalidDataError(tokenValidator);
    return;
  }

  if (!data.redirect_uri) {
    res.redirect("/");
    return;
  }

  const retreivedTokenIndex = tokens.findIndex((t) => t.token === data.code && t.client_id === data.client_id && t.redirect_uri === data.redirect_uri && t.created_at + 600000 > new Date().getTime());
  const client = clients.find((c) => c.id === data.client_id);
  if (retreivedTokenIndex === -1 || !client || (client.secret !== data.client_secret && !isValidChallenge(tokens[retreivedTokenIndex].code_challenge, data.code_verifier))) {
    res.sendJSON({
      error: "access_denied",
    });
    return;
  }

  const userId = tokens[retreivedTokenIndex].userId;
  const { accessToken, refreshToken } = getAccessToken(userId, true);

  tokens.splice(retreivedTokenIndex, 1);

  res.sendJSON({
    access_token: accessToken,
    token_type: "Bearer",
    expires_in: 3600,
    refresh_token: refreshToken,
  });
}
