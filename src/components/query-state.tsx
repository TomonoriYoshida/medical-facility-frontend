import { ApiError, isApiConfigured } from "@/lib/api/client";

export function LoadingState({ label = "読み込み中…" }: { label?: string }) {
  return (
    <p role="status" className="py-12 text-center text-sm text-muted">
      {label}
    </p>
  );
}

export function ErrorState({ error }: { error: unknown }) {
  // The layout already announces that the API isn't public yet; this isn't a failure.
  if (!isApiConfigured) {
    return <EmptyState>APIの公開後に表示されます。</EmptyState>;
  }

  const message =
    error instanceof ApiError ? error.message : "予期しないエラーが発生しました。";

  return (
    <div role="alert" className="border border-danger px-4 py-6 text-center text-sm text-danger">
      {message}
    </div>
  );
}

export function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <div className="border border-border bg-surface px-4 py-10 text-center text-sm text-muted">
      {children}
    </div>
  );
}
