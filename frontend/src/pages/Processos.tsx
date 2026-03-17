import { useState, useMemo } from "react";
import {
  useProcessLabels,
  useCreateProcessLabel,
  useUpdateProcessLabel,
  useDeleteProcessLabel,
  useProcessDocuments,
  useProcessDocument,
  useCreateProcessDocument,
  useUpdateProcessDocument,
  useDeleteProcessDocument,
} from "@/hooks/useProcesses";
import { useAppStore } from "@/store";
import { SkeletonCard } from "@/components/shared/SkeletonCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { RichTextEditor } from "@/components/shared/RichTextEditor";
import { cn } from "@/lib/utils";
import type { ProcessLabel, ProcessDocumentSummary } from "@/types/process";
import {
  FileText,
  Plus,
  X,
  Trash2,
  Pencil,
  Tag,
  Clock,
  User,
  ChevronLeft,
  Save,
  Search,
  Settings2,
  Check,
} from "lucide-react";

/* ════════════════════════════════════════════════════════════ */
/*  Constants                                                  */
/* ════════════════════════════════════════════════════════════ */

const LABEL_COLORS = [
  "#3B82F6", "#8B5CF6", "#EC4899", "#F59E0B",
  "#10B981", "#EF4444", "#6366F1", "#14B8A6",
  "#F97316", "#06B6D4", "#84CC16", "#A855F7",
];

/* ════════════════════════════════════════════════════════════ */
/*  Main page                                                  */
/* ════════════════════════════════════════════════════════════ */

export default function Processos() {
  const { selectedCompanyId } = useAppStore();
  const [filterLabelId, setFilterLabelId] = useState<string | undefined>();
  const [searchQuery, setSearchQuery] = useState("");
  const [showLabelManager, setShowLabelManager] = useState(false);
  const [editingDocId, setEditingDocId] = useState<string | null>(null);
  const [creatingDoc, setCreatingDoc] = useState(false);

  const { data: labels, isLoading: loadingLabels } = useProcessLabels(selectedCompanyId ?? undefined);
  const { data: documents, isLoading: loadingDocs } = useProcessDocuments(
    selectedCompanyId ?? undefined,
    filterLabelId,
  );

  const filteredDocs = useMemo(() => {
    if (!documents) return [];
    if (!searchQuery.trim()) return documents;
    const q = searchQuery.toLowerCase();
    return documents.filter(
      (d) =>
        d.title.toLowerCase().includes(q) ||
        d.labels.some((l) => l.name.toLowerCase().includes(q)),
    );
  }, [documents, searchQuery]);

  if (!selectedCompanyId) {
    return (
      <div className="space-y-6">
        <PageHeader />
        <EmptyState
          title="Cap empresa seleccionada"
          description="Selecciona una empresa a la pagina d'Empreses."
        />
      </div>
    );
  }

  // Show editor view
  if (editingDocId || creatingDoc) {
    return (
      <DocumentEditor
        companyId={selectedCompanyId}
        documentId={editingDocId}
        labels={labels ?? []}
        onClose={() => {
          setEditingDocId(null);
          setCreatingDoc(false);
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader />

      {/* Toolbar */}
      <div
        className="animate-fade-in-up flex flex-wrap items-center gap-3"
        style={{ animationDelay: "0.03s" }}
      >
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-tertiary" strokeWidth={1.8} />
          <input
            autoComplete="off"
            className="w-full rounded-xl border border-border bg-surface py-2 pl-9 pr-3 text-[13px] text-text-primary placeholder:text-text-tertiary focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary/20"
            placeholder="Cercar documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Label filter chips */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setFilterLabelId(undefined)}
            className={cn(
              "rounded-lg px-2.5 py-1 text-[11px] font-medium transition-colors",
              !filterLabelId
                ? "bg-secondary text-white"
                : "bg-overlay-hover text-text-secondary hover:bg-overlay-hover/80",
            )}
          >
            Tots
          </button>
          {(labels ?? []).map((label) => (
            <button
              key={label.id}
              onClick={() => setFilterLabelId(filterLabelId === label.id ? undefined : label.id)}
              className={cn(
                "flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-medium transition-colors",
                filterLabelId === label.id
                  ? "text-white"
                  : "bg-overlay-hover text-text-secondary hover:bg-overlay-hover/80",
              )}
              style={
                filterLabelId === label.id
                  ? { backgroundColor: label.color ?? "#6366F1" }
                  : undefined
              }
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: label.color ?? "#6366F1" }}
              />
              {label.name}
            </button>
          ))}
        </div>

        {/* Actions */}
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => setShowLabelManager(true)}
            className="flex items-center gap-1.5 rounded-xl border border-border px-3 py-2 text-[12px] font-medium text-text-secondary transition-colors hover:bg-overlay-hover"
          >
            <Tag className="h-3.5 w-3.5" strokeWidth={1.8} />
            Etiquetes
          </button>
          <button
            onClick={() => setCreatingDoc(true)}
            className="flex items-center gap-1.5 rounded-xl bg-secondary px-3 py-2 text-[12px] font-semibold text-white transition-colors hover:bg-secondary/90"
          >
            <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
            Nou document
          </button>
        </div>
      </div>

      {/* Label manager modal */}
      {showLabelManager && (
        <LabelManager
          companyId={selectedCompanyId}
          labels={labels ?? []}
          onClose={() => setShowLabelManager(false)}
        />
      )}

      {/* Document list */}
      {loadingDocs || loadingLabels ? (
        <div className="space-y-3">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : filteredDocs.length === 0 ? (
        <EmptyState
          title="Sense documents"
          description={
            searchQuery
              ? "Cap document coincideix amb la cerca."
              : filterLabelId
                ? "Cap document amb aquesta etiqueta."
                : "Crea el primer document de processos."
          }
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filteredDocs.map((doc, i) => (
            <DocumentCard
              key={doc.id}
              document={doc}
              onClick={() => setEditingDocId(doc.id)}
              style={{ animationDelay: `${0.04 + i * 0.02}s` }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════ */
/*  Page header                                                */
/* ════════════════════════════════════════════════════════════ */

function PageHeader() {
  return (
    <div className="animate-fade-in">
      <h1 className="text-display text-[28px] font-bold text-text-primary">
        Processos
      </h1>
      <p className="mt-1 text-[13px] text-text-tertiary">
        Documentacio de processos interns, classificada per etiquetes
      </p>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════ */
/*  Document card                                              */
/* ════════════════════════════════════════════════════════════ */

function DocumentCard({
  document: doc,
  onClick,
  style,
}: {
  document: ProcessDocumentSummary;
  onClick: () => void;
  style?: React.CSSProperties;
}) {
  const timeAgo = formatTimeAgo(doc.updated_at);

  return (
    <div
      onClick={onClick}
      className="card animate-fade-in-up cursor-pointer p-4 transition-all hover:border-secondary/30 hover:shadow-md"
      style={style}
    >
      <div className="mb-3 flex items-start justify-between">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary/8">
          <FileText className="h-4.5 w-4.5 text-secondary" strokeWidth={1.8} />
        </div>
      </div>

      <h3 className="mb-2 text-[14px] font-semibold leading-snug text-text-primary line-clamp-2">
        {doc.title}
      </h3>

      {/* Labels */}
      {doc.labels.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-1">
          {doc.labels.map((label) => (
            <span
              key={label.id}
              className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-medium"
              style={{
                backgroundColor: `${label.color ?? "#6366F1"}15`,
                color: label.color ?? "#6366F1",
              }}
            >
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: label.color ?? "#6366F1" }}
              />
              {label.name}
            </span>
          ))}
        </div>
      )}

      {/* Meta */}
      <div className="flex items-center gap-3 text-[11px] text-text-tertiary">
        {doc.created_by && (
          <span className="flex items-center gap-1">
            <User className="h-3 w-3" strokeWidth={1.5} />
            {doc.created_by}
          </span>
        )}
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3" strokeWidth={1.5} />
          {timeAgo}
        </span>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════ */
/*  Document editor                                            */
/* ════════════════════════════════════════════════════════════ */

function DocumentEditor({
  companyId,
  documentId,
  labels,
  onClose,
}: {
  companyId: string;
  documentId: string | null;
  labels: ProcessLabel[];
  onClose: () => void;
}) {
  const isNew = !documentId;
  const { data: existingDoc, isLoading } = useProcessDocument(documentId ?? undefined);
  const createDoc = useCreateProcessDocument();
  const updateDoc = useUpdateProcessDocument();
  const deleteDoc = useDeleteProcessDocument();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedLabelIds, setSelectedLabelIds] = useState<string[]>([]);
  const [initialized, setInitialized] = useState(isNew);

  // Initialize from existing doc
  if (!initialized && existingDoc) {
    setTitle(existingDoc.title);
    setContent(existingDoc.content);
    setSelectedLabelIds(existingDoc.labels.map((l) => l.id));
    setInitialized(true);
  }

  const toggleLabel = (labelId: string) => {
    setSelectedLabelIds((prev) =>
      prev.includes(labelId) ? prev.filter((id) => id !== labelId) : [...prev, labelId],
    );
  };

  const handleSave = () => {
    if (!title.trim()) return;

    if (isNew) {
      createDoc.mutate(
        {
          companyId,
          data: { title: title.trim(), content, label_ids: selectedLabelIds },
        },
        { onSuccess: onClose },
      );
    } else {
      updateDoc.mutate(
        {
          id: documentId!,
          data: { title: title.trim(), content, label_ids: selectedLabelIds },
        },
        { onSuccess: onClose },
      );
    }
  };

  const handleDelete = () => {
    if (documentId && confirm("Eliminar aquest document?")) {
      deleteDoc.mutate(documentId, { onSuccess: onClose });
    }
  };

  const isSaving = createDoc.isPending || updateDoc.isPending;

  if (!isNew && isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader />
        <SkeletonCard />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Top bar */}
      <div className="flex items-center gap-3">
        <button
          onClick={onClose}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-text-tertiary hover:bg-overlay-hover"
        >
          <ChevronLeft className="h-4 w-4" strokeWidth={2} />
        </button>
        <h1 className="text-display text-[20px] font-bold text-text-primary">
          {isNew ? "Nou document" : "Editar document"}
        </h1>
        <div className="ml-auto flex items-center gap-2">
          {!isNew && (
            <button
              onClick={handleDelete}
              className="flex items-center gap-1.5 rounded-xl border border-red-200 px-3 py-2 text-[12px] font-medium text-red-500 transition-colors hover:bg-red-500/5"
            >
              <Trash2 className="h-3.5 w-3.5" strokeWidth={1.8} />
              Eliminar
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={!title.trim() || isSaving}
            className="flex items-center gap-1.5 rounded-xl bg-secondary px-4 py-2 text-[12px] font-semibold text-white transition-colors hover:bg-secondary/90 disabled:opacity-50"
          >
            <Save className="h-3.5 w-3.5" strokeWidth={2} />
            {isSaving ? "Guardant..." : "Guardar"}
          </button>
        </div>
      </div>

      {/* Editor body */}
      <div className="grid gap-5 lg:grid-cols-[1fr_280px]">
        {/* Main editor */}
        <div className="space-y-4">
          <input
            autoComplete="off"
            autoFocus
            className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-[16px] font-semibold text-text-primary placeholder:text-text-tertiary focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary/20"
            placeholder="Titol del document"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <RichTextEditor
            content={content}
            onChange={setContent}
            placeholder="Escriu el contingut del document..."
          />
        </div>

        {/* Sidebar - labels */}
        <div className="card h-fit p-4">
          <h3 className="mb-3 flex items-center gap-2 text-[12px] font-semibold uppercase tracking-wider text-text-tertiary">
            <Tag className="h-3.5 w-3.5" strokeWidth={1.8} />
            Etiquetes
          </h3>
          {labels.length === 0 ? (
            <p className="text-[12px] text-text-tertiary">
              Cap etiqueta creada. Gestiona-les des de la llista de documents.
            </p>
          ) : (
            <div className="space-y-1.5">
              {labels.map((label) => {
                const selected = selectedLabelIds.includes(label.id);
                return (
                  <button
                    key={label.id}
                    onClick={() => toggleLabel(label.id)}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-[12px] font-medium transition-colors",
                      selected
                        ? "bg-secondary/8 text-text-primary"
                        : "text-text-secondary hover:bg-overlay-hover",
                    )}
                  >
                    <span
                      className="h-3 w-3 rounded-sm border-2 flex items-center justify-center"
                      style={{
                        borderColor: label.color ?? "#6366F1",
                        backgroundColor: selected ? (label.color ?? "#6366F1") : "transparent",
                      }}
                    >
                      {selected && <Check className="h-2 w-2 text-white" strokeWidth={3} />}
                    </span>
                    {label.name}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════ */
/*  Label manager                                              */
/* ════════════════════════════════════════════════════════════ */

function LabelManager({
  companyId,
  labels,
  onClose,
}: {
  companyId: string;
  labels: ProcessLabel[];
  onClose: () => void;
}) {
  const createLabel = useCreateProcessLabel();
  const updateLabel = useUpdateProcessLabel();
  const deleteLabel = useDeleteProcessLabel();

  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState(LABEL_COLORS[0]!);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editColor, setEditColor] = useState("");

  const handleCreate = () => {
    if (!newName.trim()) return;
    createLabel.mutate(
      { companyId, data: { name: newName.trim(), color: newColor } },
      {
        onSuccess: () => {
          setNewName("");
          setNewColor(LABEL_COLORS[(labels.length + 1) % LABEL_COLORS.length]!);
        },
      },
    );
  };

  return (
    <div className="card animate-fade-in-up p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-[15px] font-semibold text-text-primary">
          <Settings2 className="h-4 w-4 text-secondary" strokeWidth={1.8} />
          Gestionar etiquetes
        </h3>
        <button
          onClick={onClose}
          className="flex h-7 w-7 items-center justify-center rounded-lg text-text-tertiary hover:bg-overlay-hover"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Create form */}
      <div className="mb-4 flex items-end gap-2">
        <div className="flex-1">
          <label className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-text-tertiary">
            Nova etiqueta
          </label>
          <input
            autoComplete="off"
            className="w-full rounded-lg border border-border bg-bg px-2.5 py-1.5 text-[12px] text-text-primary placeholder:text-text-tertiary focus:border-secondary focus:outline-none"
            placeholder="Nom de l'etiqueta"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
          />
        </div>
        <div>
          <label className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-text-tertiary">
            Color
          </label>
          <div className="flex gap-1">
            {LABEL_COLORS.map((color) => (
              <button
                key={color}
                onClick={() => setNewColor(color)}
                className={cn(
                  "h-7 w-7 rounded-md border-2 transition-transform",
                  newColor === color ? "border-text-primary scale-110" : "border-transparent",
                )}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>
        <button
          onClick={handleCreate}
          disabled={!newName.trim() || createLabel.isPending}
          className="rounded-lg bg-secondary px-3 py-1.5 text-[12px] font-semibold text-white hover:bg-secondary/90 disabled:opacity-50"
        >
          Afegir
        </button>
      </div>

      {/* Label list */}
      {labels.length === 0 ? (
        <p className="py-4 text-center text-[12px] text-text-tertiary">
          Cap etiqueta creada encara.
        </p>
      ) : (
        <div className="space-y-1.5">
          {labels.map((label) =>
            editingId === label.id ? (
              <div key={label.id} className="flex items-center gap-2 rounded-lg border border-secondary/30 bg-bg p-2">
                <input
                  autoFocus
                  autoComplete="off"
                  className="flex-1 rounded-md border border-border bg-surface px-2 py-1 text-[12px] text-text-primary focus:border-secondary focus:outline-none"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && editName.trim()) {
                      updateLabel.mutate(
                        { id: label.id, data: { name: editName.trim(), color: editColor } },
                        { onSuccess: () => setEditingId(null) },
                      );
                    }
                    if (e.key === "Escape") setEditingId(null);
                  }}
                />
                <div className="flex gap-0.5">
                  {LABEL_COLORS.map((color) => (
                    <button
                      key={color}
                      onClick={() => setEditColor(color)}
                      className={cn(
                        "h-5 w-5 rounded border",
                        editColor === color ? "border-text-primary" : "border-transparent",
                      )}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <button
                  onClick={() => {
                    if (editName.trim()) {
                      updateLabel.mutate(
                        { id: label.id, data: { name: editName.trim(), color: editColor } },
                        { onSuccess: () => setEditingId(null) },
                      );
                    }
                  }}
                  className="flex h-6 w-6 items-center justify-center rounded bg-green-500/10 text-green-600"
                >
                  <Check className="h-3 w-3" strokeWidth={2.5} />
                </button>
                <button
                  onClick={() => setEditingId(null)}
                  className="flex h-6 w-6 items-center justify-center rounded text-text-tertiary hover:bg-overlay-hover"
                >
                  <X className="h-3 w-3" strokeWidth={2} />
                </button>
              </div>
            ) : (
              <div
                key={label.id}
                className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 transition-colors hover:bg-overlay-subtle"
              >
                <span
                  className="h-3 w-3 rounded-sm"
                  style={{ backgroundColor: label.color ?? "#6366F1" }}
                />
                <span className="flex-1 text-[13px] font-medium text-text-primary">
                  {label.name}
                </span>
                <button
                  onClick={() => {
                    setEditingId(label.id);
                    setEditName(label.name);
                    setEditColor(label.color ?? "#6366F1");
                  }}
                  className="flex h-6 w-6 items-center justify-center rounded text-text-tertiary hover:bg-secondary/8 hover:text-secondary"
                >
                  <Pencil className="h-3 w-3" strokeWidth={1.8} />
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Eliminar etiqueta "${label.name}"?`))
                      deleteLabel.mutate(label.id);
                  }}
                  className="flex h-6 w-6 items-center justify-center rounded text-text-tertiary hover:bg-red-500/10 hover:text-red-500"
                >
                  <Trash2 className="h-3 w-3" strokeWidth={1.8} />
                </button>
              </div>
            ),
          )}
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════ */
/*  Helpers                                                    */
/* ════════════════════════════════════════════════════════════ */

function formatTimeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "Ara";
  if (diffMins < 60) return `Fa ${diffMins} min`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `Fa ${diffHours}h`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) return `Fa ${diffDays}d`;
  return date.toLocaleDateString("ca-ES", { day: "numeric", month: "short", year: "numeric" });
}
