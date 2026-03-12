import { useState } from "react";
import {
  useCredentials,
  useCreateCredential,
  useUpdateCredential,
  useDeleteCredential,
  useConnectors,
  useCreateConnector,
  useUpdateConnector,
  useDeleteConnector,
  useCredentialsSummary,
} from "@/hooks/useConnectors";
import { SkeletonCard } from "@/components/shared/SkeletonCard";
import { cn } from "@/lib/utils";
import type {
  Credential,
  CredentialCreate,
  Connector,
  ConnectorCreate,
  ConnectorType,
  AuthType,
} from "@/types/connector";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Save,
  AlertCircle,
  Key,
  Plug,
  Eye,
  EyeOff,
  Globe,
  Bot,
  Cable,
} from "lucide-react";

type Tab = "connectors" | "credentials";

const AUTH_TYPE_LABELS: Record<AuthType, string> = {
  basic: "Basic Auth",
  bearer: "Bearer Token",
  api_key: "API Key",
};

const CONNECTOR_TYPE_LABELS: Record<ConnectorType, string> = {
  api_rest: "API REST",
  ai_agent: "Agent IA",
  mcp: "MCP",
};

export default function Settings() {
  const [tab, setTab] = useState<Tab>("connectors");

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="animate-fade-in">
        <h1 className="text-display text-[28px] font-bold text-text-primary">
          Configuració
        </h1>
        <p className="mt-1 text-[13px] text-text-tertiary">
          Gestiona connectors i credencials per a la recuperació automàtica de dades.
        </p>
      </div>

      {/* Tab selector */}
      <div
        className="animate-fade-in-up flex items-center gap-1 rounded-lg border border-border bg-surface p-1 w-fit"
        style={{ animationDelay: "0.03s" }}
      >
        <button
          onClick={() => setTab("connectors")}
          className={cn(
            "flex items-center gap-1.5 rounded-md px-4 py-2 text-[12px] font-medium transition-colors",
            tab === "connectors"
              ? "bg-secondary text-white"
              : "text-text-tertiary hover:text-text-secondary hover:bg-overlay-muted",
          )}
        >
          <Plug className="h-3.5 w-3.5" strokeWidth={2} />
          Connectors
        </button>
        <button
          onClick={() => setTab("credentials")}
          className={cn(
            "flex items-center gap-1.5 rounded-md px-4 py-2 text-[12px] font-medium transition-colors",
            tab === "credentials"
              ? "bg-secondary text-white"
              : "text-text-tertiary hover:text-text-secondary hover:bg-overlay-muted",
          )}
        >
          <Key className="h-3.5 w-3.5" strokeWidth={2} />
          Credencials
        </button>
      </div>

      {/* Tab content */}
      {tab === "connectors" ? <ConnectorsPanel /> : <CredentialsPanel />}
    </div>
  );
}

/* ── Connectors Panel ── */
function ConnectorsPanel() {
  const { data: connectors, isLoading } = useConnectors();
  const [editing, setEditing] = useState<Connector | null>(null);
  const [creating, setCreating] = useState(false);

  const showForm = creating || editing !== null;

  return (
    <div
      className={cn(
        "animate-fade-in-up grid gap-6",
        showForm ? "lg:grid-cols-[1fr_460px]" : "grid-cols-1",
      )}
      style={{ animationDelay: "0.06s" }}
    >
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between border-b border-border-subtle bg-overlay-subtle px-4 py-2.5">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-text-tertiary">
            Connectors ({connectors?.length ?? 0})
          </span>
          <button
            onClick={() => { setEditing(null); setCreating(true); }}
            className="flex items-center gap-1.5 rounded-lg bg-secondary px-3 py-1.5 text-[11px] font-medium text-white transition-colors hover:bg-secondary-light"
          >
            <Plus className="h-3 w-3" strokeWidth={2} />
            Nou
          </button>
        </div>
        {isLoading ? (
          <div className="p-4 space-y-2"><SkeletonCard /><SkeletonCard /></div>
        ) : connectors?.length === 0 ? (
          <div className="flex items-center justify-center p-12">
            <div className="text-center">
              <Plug className="mx-auto h-10 w-10 text-text-tertiary/30" strokeWidth={1.5} />
              <p className="mt-3 text-[14px] font-medium text-text-secondary">Cap connector configurat</p>
              <p className="mt-1 text-[12px] text-text-tertiary">Crea un connector per connectar indicadors a fonts de dades externes.</p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-border-subtle">
            {connectors?.map((conn) => (
              <div
                key={conn.id}
                className={cn(
                  "flex items-center gap-4 px-5 py-3 transition-colors",
                  editing?.id === conn.id ? "bg-secondary/5" : "hover:bg-overlay-subtle",
                )}
              >
                <div className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-lg",
                  conn.type === "api_rest" ? "bg-blue-500/10" : conn.type === "mcp" ? "bg-teal-500/10" : "bg-purple-500/10",
                )}>
                  {conn.type === "api_rest" ? (
                    <Globe className="h-4 w-4 text-blue-400" strokeWidth={2} />
                  ) : conn.type === "mcp" ? (
                    <Cable className="h-4 w-4 text-teal-400" strokeWidth={2} />
                  ) : (
                    <Bot className="h-4 w-4 text-purple-400" strokeWidth={2} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-text-primary truncate">{conn.name}</p>
                  <p className="text-[11px] text-text-tertiary">
                    {CONNECTOR_TYPE_LABELS[conn.type]}
                    {conn.credential_name && (
                      <span className="ml-1.5 text-secondary">{conn.credential_name}</span>
                    )}
                  </p>
                </div>
                {!conn.active && (
                  <span className="rounded-full bg-red-500/10 px-2 py-0.5 text-[10px] font-semibold text-red-400">
                    Inactiu
                  </span>
                )}
                <button
                  onClick={() => { setCreating(false); setEditing(conn); }}
                  className="rounded-lg p-1.5 text-text-tertiary transition-colors hover:bg-overlay-muted hover:text-secondary"
                  aria-label={`Editar ${conn.name}`}
                >
                  <Pencil className="h-3.5 w-3.5" strokeWidth={2} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {showForm && (
        <ConnectorForm
          connector={editing}
          onClose={() => { setCreating(false); setEditing(null); }}
        />
      )}
    </div>
  );
}

/* ── Connector Form ── */
function ConnectorForm({ connector, onClose }: { connector: Connector | null; onClose: () => void }) {
  const isNew = connector === null;
  const { data: credentialsSummary } = useCredentialsSummary();

  const [form, setForm] = useState<ConnectorCreate>(() => {
    if (connector) {
      return {
        name: connector.name,
        type: connector.type,
        credential_id: connector.credential_id ?? undefined,
        config: connector.config ?? {},
        active: connector.active,
      };
    }
    return { name: "", type: "api_rest" as ConnectorType, config: {}, active: true };
  });

  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const createMutation = useCreateConnector();
  const updateMutation = useUpdateConnector();
  const deleteMutation = useDeleteConnector();
  const isPending = createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

  const handleSave = async () => {
    setError(null);
    if (!form.name.trim()) { setError("El nom és obligatori."); return; }
    try {
      if (isNew) {
        await createMutation.mutateAsync(form);
      } else {
        await updateMutation.mutateAsync({ id: connector!.id, data: form });
      }
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error desant");
    }
  };

  const handleDelete = async () => {
    if (!connector) return;
    try {
      await deleteMutation.mutateAsync(connector.id);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error eliminant");
    }
  };

  const inputClass =
    "w-full rounded-lg border border-border bg-overlay-muted px-3 py-2 text-[13px] text-text-primary placeholder:text-text-tertiary focus:border-secondary/40 focus:outline-none focus:ring-2 focus:ring-secondary/20 transition-colors";
  const labelClass = "mb-1 block text-[10px] font-semibold uppercase tracking-wider text-text-tertiary";

  const config = (form.config ?? {}) as Record<string, string>;
  const setConfig = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, config: { ...(prev.config ?? {}), [key]: value } }));
  };

  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between border-b border-border-subtle bg-overlay-subtle px-5 py-3">
        <span className="text-[13px] font-semibold text-text-primary">
          {isNew ? "Nou connector" : `Editar ${connector!.name}`}
        </span>
        <button onClick={onClose} className="rounded-lg p-1 text-text-tertiary transition-colors hover:bg-overlay-muted hover:text-text-primary" aria-label="Tancar">
          <X className="h-4 w-4" strokeWidth={2} />
        </button>
      </div>

      <div className="max-h-[calc(100vh-320px)] overflow-y-auto p-5 space-y-4">
        {/* Type selector */}
        <div>
          <label className={labelClass}>Tipus</label>
          <div className="flex gap-2">
            {(["api_rest", "ai_agent", "mcp"] as const).map((t) => {
              const activeStyles = t === "api_rest"
                ? "bg-blue-500/10 text-blue-400 ring-1 ring-blue-500/30"
                : t === "mcp"
                  ? "bg-teal-500/10 text-teal-400 ring-1 ring-teal-500/30"
                  : "bg-purple-500/10 text-purple-400 ring-1 ring-purple-500/30";
              const Icon = t === "api_rest" ? Globe : t === "mcp" ? Cable : Bot;
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, type: t }))}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-[12px] font-semibold transition-colors",
                    form.type === t
                      ? activeStyles
                      : "border border-border bg-overlay-muted text-text-tertiary hover:bg-overlay-hover",
                  )}
                >
                  <Icon className="h-3.5 w-3.5" strokeWidth={2} />
                  {CONNECTOR_TYPE_LABELS[t]}
                </button>
              );
            })}
          </div>
        </div>

        {/* Name */}
        <div>
          <label className={labelClass}>Nom</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
            placeholder={form.type === "api_rest" ? "Meraki API" : form.type === "mcp" ? "Atlassian MCP" : "Rovo - Jira Agent"}
            className={inputClass}
          />
        </div>

        {/* API REST specific fields */}
        {form.type === "api_rest" && (
          <>
            {/* Credential selector */}
            <div>
              <label className={labelClass}>Credencial</label>
              <select
                value={form.credential_id ?? ""}
                onChange={(e) => setForm((prev) => ({ ...prev, credential_id: e.target.value || undefined }))}
                className={inputClass}
              >
                <option value="">— Sense credencial —</option>
                {(credentialsSummary ?? []).map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({AUTH_TYPE_LABELS[c.auth_type]})
                  </option>
                ))}
              </select>
            </div>

            {/* Endpoint */}
            <div>
              <label className={labelClass}>Endpoint</label>
              <input
                type="text"
                value={config.endpoint ?? ""}
                onChange={(e) => setConfig("endpoint", e.target.value)}
                placeholder="/api/v1/data"
                className={inputClass}
              />
            </div>

            {/* Method */}
            <div>
              <label className={labelClass}>Mètode HTTP</label>
              <select
                value={config.method ?? "GET"}
                onChange={(e) => setConfig("method", e.target.value)}
                className={inputClass}
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
              </select>
            </div>

            {/* Headers */}
            <div>
              <label className={labelClass}>Headers addicionals (JSON)</label>
              <textarea
                value={config.headers ?? "{}"}
                onChange={(e) => setConfig("headers", e.target.value)}
                placeholder='{"Accept": "application/json"}'
                rows={3}
                className={cn(inputClass, "resize-y text-data text-[11px]")}
              />
            </div>
          </>
        )}

        {/* AI Agent specific fields */}
        {form.type === "ai_agent" && (
          <>
            {/* Provider */}
            <div>
              <label className={labelClass}>Proveïdor</label>
              <select
                value={config.provider ?? "rovo"}
                onChange={(e) => setConfig("provider", e.target.value)}
                className={inputClass}
              >
                <option value="rovo">Rovo (Jira AI)</option>
                <option value="other">Altre</option>
              </select>
            </div>

            {/* System Prompt */}
            <div>
              <label className={labelClass}>System Prompt</label>
              <textarea
                value={config.system_prompt ?? ""}
                onChange={(e) => setConfig("system_prompt", e.target.value)}
                placeholder="Ets un agent que recupera dades de KPIs..."
                rows={6}
                className={cn(inputClass, "resize-y")}
              />
            </div>

            {/* Credential (optional for AI too) */}
            <div>
              <label className={labelClass}>Credencial (API Key del proveïdor)</label>
              <select
                value={form.credential_id ?? ""}
                onChange={(e) => setForm((prev) => ({ ...prev, credential_id: e.target.value || undefined }))}
                className={inputClass}
              >
                <option value="">— Sense credencial —</option>
                {(credentialsSummary ?? []).map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({AUTH_TYPE_LABELS[c.auth_type]})
                  </option>
                ))}
              </select>
            </div>
          </>
        )}

        {/* MCP specific fields */}
        {form.type === "mcp" && (
          <>
            {/* Server URL */}
            <div>
              <label className={labelClass}>URL del servidor MCP</label>
              <input
                type="text"
                value={config.server_url ?? ""}
                onChange={(e) => setConfig("server_url", e.target.value)}
                placeholder="https://mcp.atlassian.com/v1/mcp"
                className={inputClass}
              />
              <p className="mt-1 text-[11px] text-text-tertiary">
                URL completa del servidor MCP (SSE o Streamable HTTP).
              </p>
            </div>

            {/* Transport */}
            <div>
              <label className={labelClass}>Transport</label>
              <select
                value={config.transport ?? "sse"}
                onChange={(e) => setConfig("transport", e.target.value)}
                className={inputClass}
              >
                <option value="sse">SSE (Server-Sent Events)</option>
                <option value="streamable_http">Streamable HTTP</option>
                <option value="stdio">Stdio (local)</option>
              </select>
            </div>

            {/* Credential (optional for MCP) */}
            <div>
              <label className={labelClass}>Credencial (autenticació al servidor)</label>
              <select
                value={form.credential_id ?? ""}
                onChange={(e) => setForm((prev) => ({ ...prev, credential_id: e.target.value || undefined }))}
                className={inputClass}
              >
                <option value="">— Sense credencial —</option>
                {(credentialsSummary ?? []).map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({AUTH_TYPE_LABELS[c.auth_type]})
                  </option>
                ))}
              </select>
            </div>
          </>
        )}

        {/* Active toggle */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setForm((prev) => ({ ...prev, active: !prev.active }))}
            className={cn("relative h-6 w-11 rounded-full transition-colors", form.active ? "bg-secondary" : "bg-overlay-active")}
            role="switch"
            aria-checked={form.active}
          >
            <span className={cn("absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform shadow-sm", form.active && "translate-x-5")} />
          </button>
          <span className="text-[12px] font-medium text-text-secondary">{form.active ? "Actiu" : "Inactiu"}</span>
        </div>

        {error && (
          <p className="flex items-center gap-1.5 rounded-lg bg-red-500/10 px-3 py-2 text-[12px] text-red-400">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
            {error}
          </p>
        )}
      </div>

      <div className="flex items-center gap-2 border-t border-border-subtle bg-overlay-subtle px-5 py-3">
        <button onClick={handleSave} disabled={isPending} className="flex items-center gap-1.5 rounded-lg bg-secondary px-4 py-2 text-[12px] font-medium text-white transition-colors hover:bg-secondary-light disabled:opacity-40">
          {isPending ? "..." : <><Save className="h-3.5 w-3.5" strokeWidth={2} />{isNew ? "Crear" : "Guardar"}</>}
        </button>
        <button onClick={onClose} className="rounded-lg border border-border px-4 py-2 text-[12px] font-medium text-text-secondary transition-colors hover:bg-overlay-hover">Cancel·lar</button>
        {!isNew && (
          <div className="ml-auto">
            {confirmDelete ? (
              <button onClick={handleDelete} disabled={isPending} className="flex items-center gap-1.5 rounded-lg bg-red-500/10 px-4 py-2 text-[12px] font-medium text-red-400 transition-colors hover:bg-red-500/20 disabled:opacity-40">
                <Trash2 className="h-3.5 w-3.5" strokeWidth={2} />Confirmar
              </button>
            ) : (
              <button onClick={() => setConfirmDelete(true)} className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-[12px] text-text-tertiary transition-colors hover:bg-red-500/10 hover:text-red-400">
                <Trash2 className="h-3.5 w-3.5" strokeWidth={2} />Eliminar
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Credentials Panel ── */
function CredentialsPanel() {
  const { data: credentials, isLoading } = useCredentials();
  const [editing, setEditing] = useState<Credential | null>(null);
  const [creating, setCreating] = useState(false);

  const showForm = creating || editing !== null;

  return (
    <div
      className={cn(
        "animate-fade-in-up grid gap-6",
        showForm ? "lg:grid-cols-[1fr_460px]" : "grid-cols-1",
      )}
      style={{ animationDelay: "0.06s" }}
    >
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between border-b border-border-subtle bg-overlay-subtle px-4 py-2.5">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-text-tertiary">
            Credencials ({credentials?.length ?? 0})
          </span>
          <button
            onClick={() => { setEditing(null); setCreating(true); }}
            className="flex items-center gap-1.5 rounded-lg bg-secondary px-3 py-1.5 text-[11px] font-medium text-white transition-colors hover:bg-secondary-light"
          >
            <Plus className="h-3 w-3" strokeWidth={2} />
            Nova
          </button>
        </div>
        {isLoading ? (
          <div className="p-4 space-y-2"><SkeletonCard /><SkeletonCard /></div>
        ) : credentials?.length === 0 ? (
          <div className="flex items-center justify-center p-12">
            <div className="text-center">
              <Key className="mx-auto h-10 w-10 text-text-tertiary/30" strokeWidth={1.5} />
              <p className="mt-3 text-[14px] font-medium text-text-secondary">Cap credencial configurada</p>
              <p className="mt-1 text-[12px] text-text-tertiary">Les credencials s'utilitzen per autenticar-se a APIs externes.</p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-border-subtle">
            {credentials?.map((cred) => (
              <div
                key={cred.id}
                className={cn(
                  "flex items-center gap-4 px-5 py-3 transition-colors",
                  editing?.id === cred.id ? "bg-secondary/5" : "hover:bg-overlay-subtle",
                )}
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/10">
                  <Key className="h-4 w-4 text-amber-400" strokeWidth={2} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-text-primary truncate">{cred.name}</p>
                  <p className="text-[11px] text-text-tertiary">
                    {AUTH_TYPE_LABELS[cred.auth_type]}
                    {cred.username && <span className="ml-1.5">· {cred.username}</span>}
                    {cred.base_url && <span className="ml-1.5 text-secondary">{cred.base_url}</span>}
                  </p>
                </div>
                <span className="text-data text-[11px] text-text-tertiary">{cred.token_masked}</span>
                {!cred.active && (
                  <span className="rounded-full bg-red-500/10 px-2 py-0.5 text-[10px] font-semibold text-red-400">Inactiu</span>
                )}
                <button
                  onClick={() => { setCreating(false); setEditing(cred); }}
                  className="rounded-lg p-1.5 text-text-tertiary transition-colors hover:bg-overlay-muted hover:text-secondary"
                  aria-label={`Editar ${cred.name}`}
                >
                  <Pencil className="h-3.5 w-3.5" strokeWidth={2} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {showForm && (
        <CredentialForm
          credential={editing}
          onClose={() => { setCreating(false); setEditing(null); }}
        />
      )}
    </div>
  );
}

/* ── Credential Form ── */
function CredentialForm({ credential, onClose }: { credential: Credential | null; onClose: () => void }) {
  const isNew = credential === null;
  const [showToken, setShowToken] = useState(false);

  const [form, setForm] = useState<CredentialCreate>(() => {
    if (credential) {
      return {
        name: credential.name,
        auth_type: credential.auth_type,
        username: credential.username ?? "",
        token: "", // never pre-fill token
        base_url: credential.base_url ?? "",
        active: credential.active,
      };
    }
    return { name: "", auth_type: "bearer" as AuthType, username: "", token: "", base_url: "", active: true };
  });

  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const createMutation = useCreateCredential();
  const updateMutation = useUpdateCredential();
  const deleteMutation = useDeleteCredential();
  const isPending = createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

  const handleSave = async () => {
    setError(null);
    if (!form.name.trim()) { setError("El nom és obligatori."); return; }
    if (isNew && !form.token.trim()) { setError("El token és obligatori."); return; }
    try {
      if (isNew) {
        await createMutation.mutateAsync(form);
      } else {
        // Only send token if changed
        const update: Record<string, unknown> = {
          name: form.name,
          auth_type: form.auth_type,
          username: form.username || null,
          base_url: form.base_url || null,
          active: form.active,
        };
        if (form.token.trim()) update.token = form.token;
        await updateMutation.mutateAsync({ id: credential!.id, data: update });
      }
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error desant");
    }
  };

  const handleDelete = async () => {
    if (!credential) return;
    try {
      await deleteMutation.mutateAsync(credential.id);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error eliminant");
    }
  };

  const inputClass =
    "w-full rounded-lg border border-border bg-overlay-muted px-3 py-2 text-[13px] text-text-primary placeholder:text-text-tertiary focus:border-secondary/40 focus:outline-none focus:ring-2 focus:ring-secondary/20 transition-colors";
  const labelClass = "mb-1 block text-[10px] font-semibold uppercase tracking-wider text-text-tertiary";

  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between border-b border-border-subtle bg-overlay-subtle px-5 py-3">
        <span className="text-[13px] font-semibold text-text-primary">
          {isNew ? "Nova credencial" : `Editar ${credential!.name}`}
        </span>
        <button onClick={onClose} className="rounded-lg p-1 text-text-tertiary transition-colors hover:bg-overlay-muted hover:text-text-primary" aria-label="Tancar">
          <X className="h-4 w-4" strokeWidth={2} />
        </button>
      </div>

      <div className="max-h-[calc(100vh-320px)] overflow-y-auto p-5 space-y-4">
        {/* Name */}
        <div>
          <label className={labelClass}>Nom</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
            placeholder="Meraki API Credentials"
            className={inputClass}
          />
        </div>

        {/* Auth type */}
        <div>
          <label className={labelClass}>Tipus d'autenticació</label>
          <select
            value={form.auth_type}
            onChange={(e) => setForm((prev) => ({ ...prev, auth_type: e.target.value as AuthType }))}
            className={inputClass}
          >
            <option value="bearer">Bearer Token</option>
            <option value="basic">Basic Auth</option>
            <option value="api_key">API Key</option>
          </select>
        </div>

        {/* Username (for basic auth) */}
        {form.auth_type === "basic" && (
          <div>
            <label className={labelClass}>Usuari</label>
            <input
              type="text"
              value={form.username ?? ""}
              onChange={(e) => setForm((prev) => ({ ...prev, username: e.target.value }))}
              placeholder="user@domain.com"
              className={inputClass}
            />
          </div>
        )}

        {/* Token */}
        <div>
          <label className={labelClass}>
            {form.auth_type === "basic" ? "Password" : form.auth_type === "api_key" ? "API Key" : "Token"}
            {!isNew && <span className="ml-1 text-amber-400 normal-case">(deixa buit per mantenir)</span>}
          </label>
          <div className="relative">
            <input
              type={showToken ? "text" : "password"}
              value={form.token}
              onChange={(e) => setForm((prev) => ({ ...prev, token: e.target.value }))}
              placeholder={isNew ? "Token d'autenticació" : credential!.token_masked}
              className={cn(inputClass, "pr-10 text-data")}
            />
            <button
              type="button"
              onClick={() => setShowToken(!showToken)}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-text-tertiary hover:text-text-secondary"
              aria-label={showToken ? "Amagar token" : "Mostrar token"}
            >
              {showToken ? <EyeOff className="h-3.5 w-3.5" strokeWidth={2} /> : <Eye className="h-3.5 w-3.5" strokeWidth={2} />}
            </button>
          </div>
        </div>

        {/* Base URL */}
        <div>
          <label className={labelClass}>URL Base</label>
          <input
            type="text"
            value={form.base_url ?? ""}
            onChange={(e) => setForm((prev) => ({ ...prev, base_url: e.target.value }))}
            placeholder="https://api.meraki.com/v1"
            className={inputClass}
          />
        </div>

        {/* Active toggle */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setForm((prev) => ({ ...prev, active: !prev.active }))}
            className={cn("relative h-6 w-11 rounded-full transition-colors", form.active ? "bg-secondary" : "bg-overlay-active")}
            role="switch"
            aria-checked={form.active}
          >
            <span className={cn("absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform shadow-sm", form.active && "translate-x-5")} />
          </button>
          <span className="text-[12px] font-medium text-text-secondary">{form.active ? "Activa" : "Inactiva"}</span>
        </div>

        {error && (
          <p className="flex items-center gap-1.5 rounded-lg bg-red-500/10 px-3 py-2 text-[12px] text-red-400">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
            {error}
          </p>
        )}
      </div>

      <div className="flex items-center gap-2 border-t border-border-subtle bg-overlay-subtle px-5 py-3">
        <button onClick={handleSave} disabled={isPending} className="flex items-center gap-1.5 rounded-lg bg-secondary px-4 py-2 text-[12px] font-medium text-white transition-colors hover:bg-secondary-light disabled:opacity-40">
          {isPending ? "..." : <><Save className="h-3.5 w-3.5" strokeWidth={2} />{isNew ? "Crear" : "Guardar"}</>}
        </button>
        <button onClick={onClose} className="rounded-lg border border-border px-4 py-2 text-[12px] font-medium text-text-secondary transition-colors hover:bg-overlay-hover">Cancel·lar</button>
        {!isNew && (
          <div className="ml-auto">
            {confirmDelete ? (
              <button onClick={handleDelete} disabled={isPending} className="flex items-center gap-1.5 rounded-lg bg-red-500/10 px-4 py-2 text-[12px] font-medium text-red-400 transition-colors hover:bg-red-500/20 disabled:opacity-40">
                <Trash2 className="h-3.5 w-3.5" strokeWidth={2} />Confirmar
              </button>
            ) : (
              <button onClick={() => setConfirmDelete(true)} className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-[12px] text-text-tertiary transition-colors hover:bg-red-500/10 hover:text-red-400">
                <Trash2 className="h-3.5 w-3.5" strokeWidth={2} />Eliminar
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
