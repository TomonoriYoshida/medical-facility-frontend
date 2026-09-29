"use client";

export default function Error({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <div role="alert" className="rounded-xl border border-danger/40 px-4 py-10 text-center">
      <p className="text-danger">ページの表示中にエラーが発生しました。</p>
      <button
        type="button"
        onClick={() => retry()}
        className="mt-4 rounded-lg border border-border px-4 py-2 text-sm hover:bg-surface"
      >
        再読み込み
      </button>
    </div>
  );
}
