"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { useMaintenance } from "@/lib/api/queries";

/** Shown under the header on every page while the API is down for maintenance. */
export default function MaintenanceNotice() {
  const { data: isUnderMaintenance = false } = useMaintenance();
  const queryClient = useQueryClient();
  const wasUnderMaintenance = useRef(false);

  // Once maintenance ends, reload what failed during it instead of leaving the error on screen.
  useEffect(() => {
    if (wasUnderMaintenance.current && !isUnderMaintenance) {
      queryClient.refetchQueries({ predicate: (query) => query.state.status === "error" });
    }
    wasUnderMaintenance.current = isUnderMaintenance;
  }, [isUnderMaintenance, queryClient]);

  if (!isUnderMaintenance) {
    return null;
  }

  return (
    <div role="status" className="border-b border-warning-border bg-warning-surface">
      <p className="mx-auto flex w-full max-w-5xl gap-2.5 px-4 py-3 text-sm leading-relaxed sm:px-6">
        <svg aria-hidden viewBox="0 0 20 20" className="mt-0.5 size-4 flex-none fill-current text-warning">
          <path d="M10 1.5a8.5 8.5 0 1 0 0 17 8.5 8.5 0 0 0 0-17Zm0 2a6.5 6.5 0 1 1 0 13 6.5 6.5 0 0 1 0-13Zm-.9 2.6h1.8v5h-1.8v-5Zm0 6.3h1.8v1.8h-1.8v-1.8Z" />
        </svg>
        <span>
          <strong className="mr-3 text-warning">メンテナンス中</strong>
          サーバーのメンテナンスのため、検索などの機能を一時的に停止しています。終わりしだい自動で表示が戻ります。
        </span>
      </p>
    </div>
  );
}
