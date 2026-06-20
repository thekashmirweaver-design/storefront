export type CustomerOpenIdConfig = {
  authorization_endpoint: string;
  token_endpoint: string;
  end_session_endpoint?: string;
  jwks_uri?: string;
  issuer?: string;
};

export type CustomerAccountApiConfig = {
  graphql_api: string;
};

export type CustomerTokenResponse = {
  access_token: string;
  refresh_token: string;
  id_token: string;
  expires_in: number;
};
