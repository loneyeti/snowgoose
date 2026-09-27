import React from "react";
import type { Citation, ContentBlock } from "@/app/_lib/model";
import { safeResearchUrl } from "./research-links";

function collectSources(blocks: ContentBlock[]): Citation[] {
  const byUrl = new Map<string, Citation>();
  for (const block of blocks) {
    if (block.type !== "text") continue;
    for (const citation of block.citations ?? []) {
      const link = safeResearchUrl(citation.url);
      if (!link) continue;
      const previous = byUrl.get(link.href);
      byUrl.set(link.href, {
        ...previous,
        ...citation,
        url: link.href,
        title: citation.title || previous?.title,
        citedText: citation.citedText || previous?.citedText,
      });
    }
  }
  return Array.from(byUrl.values());
}

export default function SourcesList({ blocks }: { blocks: ContentBlock[] }) {
  const sources = collectSources(blocks);
  if (sources.length === 0) return null;

  return (
    <section aria-label="Sources" className="mt-4 text-sm">
      <h3 className="mb-1 text-sm font-semibold">Sources</h3>
      <ol className="mt-1 list-decimal space-y-1 pl-6">
        {sources.map((source) => {
          const link = safeResearchUrl(source.url)!;
          return (
            <li key={link.href} className="break-words">
              <a href={link.href} target="_blank" rel="noopener noreferrer">
                {source.title || link.domain}
              </a>
              <span className="ml-1 text-xs text-slate-500 dark:text-slate-400">
                {link.domain}
              </span>
              {source.citedText && (
                <details className="mt-1 text-xs">
                  <summary className="cursor-pointer">Cited passage</summary>
                  <p className="mt-1 whitespace-pre-wrap">{source.citedText}</p>
                </details>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
