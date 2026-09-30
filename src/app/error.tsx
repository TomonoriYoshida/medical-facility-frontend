"use client";

export default function Error({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <div role="alert" className="border border-danger px-4 py-10 text-center">
      <p className="text-danger">ページの表示中にエラーが発生しました。</p>
      <button
        type="button"
        onClick={() => retry()}
        className="mt-4 rounded-sm border border-accent px-4 py-1.5 text-sm font-bold text-accent hover:bg-band"
      >
        再読み込み
      </button>
    </div>
  );
}
