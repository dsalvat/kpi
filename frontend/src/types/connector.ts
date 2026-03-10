export type AuthType = "basic" | "bearer" | "api_key";
export type ConnectorType = "api_rest" | "ai_agent" | "mcp";
export type SourceType = "manual" | "api_rest" | "ai_agent" | "mcp";

export interface Credential {
  id: string;
  name: string;
  auth_type: AuthType;
  username: string | null;
  token_masked: string;
  base_url: string | null;
  active: boolean;
}

export interface CredentialCreate {
  name: string;
  auth_type: AuthType;
  username?: string;
  token: string;
  base_url?: string;
  active?: boolean;
}

export interface CredentialUpdate {
  name?: string;
  auth_type?: AuthType;
  username?: string | null;
  token?: string;
  base_url?: string | null;
  active?: boolean;
}

export interface CredentialSummary {
  id: string;
  name: string;
  auth_type: AuthType;
  base_url: string | null;
}

export interface Connector {
  id: string;
  name: string;
  type: ConnectorType;
  credential_id: string | null;
  credential_name: string | null;
  config: Record<string, unknown> | null;
  active: boolean;
}

export interface ConnectorCreate {
  name: string;
  type: ConnectorType;
  credential_id?: string;
  config?: Record<string, unknown>;
  active?: boolean;
}

export interface ConnectorUpdate {
  name?: string;
  type?: ConnectorType;
  credential_id?: string | null;
  config?: Record<string, unknown> | null;
  active?: boolean;
}

export interface ConnectorSummary {
  id: string;
  name: string;
  type: ConnectorType;
}
