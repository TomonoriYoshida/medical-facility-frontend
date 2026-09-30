import type { Attribution } from "@/lib/api/types";

/**
 * The data license (公共データ利用規約 1.0) requires crediting the source
 * wherever the data is shown, so every data page renders the API's own
 * attribution block rather than a hard-coded copy.
 */
export default function AttributionNotice({ attribution }: { attribution: Attribution }) {
  return (
    <aside className="mt-12 border-t-2 border-accent pt-3 text-xs leading-6 text-muted">
      <p className="font-bold text-accent">データの出典</p>
      <ul className="mt-1 list-disc space-y-0.5 pl-5">
        <li>{attribution.notice}</li>
        <li>
          ライセンス：
          <a
            href={attribution.license.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent underline underline-offset-2"
          >
            {attribution.license.name}
          </a>
        </li>
        <li>{attribution.disclaimer}</li>
      </ul>
      <details className="mt-1">
        <summary className="cursor-pointer text-accent">出典元（各地方厚生局）</summary>
        <ul className="mt-1 flex flex-wrap gap-x-4 gap-y-1 pl-5">
          {attribution.sources.map((source) => (
            <li key={source.url}>
              <a
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent underline underline-offset-2"
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
