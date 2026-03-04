import { Inbox } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description?: string;
}

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="card flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-white/[0.06]">
        <Inbox className="h-6 w-6 text-text-tertiary" strokeWidth={1.5} />
      </div>
      <p className="text-sm font-medium text-text-secondary">{title}</p>
      {description && (
        <p className="mt-1 max-w-xs text-[13px] text-text-tertiary">
          {description}
        </p>
      )}
    </div>
  );
}
