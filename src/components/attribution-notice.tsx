import type { Attribution } from "@/lib/api/types";

/**
 * The data license (公共データ利用規約 1.0) requires crediting the source
 * wherever the data is shown, so every data page renders the API's own
 * attribution block rather than a hard-coded copy.
 */
export default function AttributionNotice({ attribution }: { attribution: Attribution }) {
  return (
    <aside className="mt-12 rounded-xl border border-border bg-surface p-5 text-xs leading-6 text-muted">
      <p>{attribution.notice}</p>
      <p>
        ライセンス:{" "}
        <a
          href={attribution.license.url}
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-foreground"
        >
          {attribution.license.name}
        </a>
      </p>
      <p>{attribution.disclaimer}</p>
      <details className="mt-2">
        <summary className="cursor-pointer hover:text-foreground">出典（各地方厚生局）</summary>
        <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
          {attribution.sources.map((source) => (
            <li key={source.url}>
              <a
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-foreground"
              >
                {source.bureau}
              </a>
            </li>
          ))}
        </ul>
      </details>
    </aside>
  );
}
