import { ApiError } from "@/lib/api/client";

export function LoadingState({ label = "読み込み中…" }: { label?: string }) {
  return (
    <p role="status" className="py-12 text-center text-sm text-muted">
      {label}
    </p>
  );
}

export function ErrorState({ error }: { error: unknown }) {
  const message =
    error instanceof ApiError ? error.message : "予期しないエラーが発生しました。";

  return (
    <div
      role="alert"
      className="rounded-xl border border-danger/40 px-4 py-6 text-center text-sm text-danger"
    >
      {message}
    </div>
  );
}

export function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed border-border px-4 py-12 text-center text-sm text-muted">
      {children}
    </div>
  );
}
