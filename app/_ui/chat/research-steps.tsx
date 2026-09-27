import React from "react";
import type {
  ServerToolUseBlock,
  WebFetchToolResultBlock,
  WebSearchToolResultBlock,
} from "@/app/_lib/model";
import { Spinner, SpinnerSize } from "../spinner";
import { safeResearchUrl } from "./research-links";

export type ResearchBlock =
  | ServerToolUseBlock
  | WebSearchToolResultBlock
  | WebFetchToolResultBlock;

interface ResearchStep {
  id: string;
  use?: ServerToolUseBlock;
  searchResult?: WebSearchToolResultBlock;
  fetchResult?: WebFetchToolResultBlock;
}

function groupSteps(blocks: ResearchBlock[]): ResearchStep[] {
  const steps: ResearchStep[] = [];
  const byId = new Map<string, ResearchStep>();
  for (const block of blocks) {
    const id = block.type === "server_tool_use" ? block.id : block.toolUseId;
    let step = byId.get(id);
    if (!step) {
      step = { id };
      byId.set(id, step);
      steps.push(step);
    }
    if (block.type === "server_tool_use") step.use = block;
    if (block.type === "web_search_tool_result") step.searchResult = block;
    if (block.type === "web_fetch_tool_result") step.fetchResult = block;
  }
  return steps;
}

function parseInput(input: string | undefined): Record<string, unknown> {
  try {
    const parsed: unknown = JSON.parse(input ?? "{}");
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? (parsed as Record<string, unknown>)
      : {};
  } catch {
    return {};
  }
}

function inputString(
  input: Record<string, unknown>,
  key: string,
): string | undefined {
  return typeof input[key] === "string" ? (input[key] as string) : undefined;
}

function stepLabel(step: ResearchStep): string {
  const input = parseInput(step.use?.input);
  const url = inputString(input, "url");
  const pattern = inputString(input, "pattern");
  const query =
    inputString(input, "query") ||
    (Array.isArray(input.queries) && typeof input.queries[0] === "string"
      ? input.queries[0]
      : undefined);

  if (step.use?.name === "web_fetch" || step.fetchResult) {
    return `Read ${step.fetchResult?.title || step.fetchResult?.url || url || "page"}`;
  }
  if (pattern) return `Found ${pattern}${url ? ` on ${url}` : ""}`;
  if (url) return `Opened ${url}`;
  return query ? `Searched ${query}` : "Searching the web";
}

function ResearchStepRow({ step }: { step: ResearchStep }) {
  const errorCode = step.searchResult?.errorCode || step.fetchResult?.errorCode;
  const failed = !!errorCode || step.use?.status === "failed";
  const inProgress = step.use?.status === "in_progress" && !failed;
  const results = step.searchResult?.results;
  const count = results && !failed ? ` · ${results.length} results` : "";
  const label = `${stepLabel(step)}${count}${
    failed ? ` · failed${errorCode ? ` (${errorCode})` : ""}` : ""
  }`;
  const icon = step.use?.name === "web_fetch" || step.fetchResult ? "📄" : "🔎";
  const fetchUrl =
    step.fetchResult?.url || inputString(parseInput(step.use?.input), "url");
  const fetchLink = icon === "📄" ? safeResearchUrl(fetchUrl) : null;
  const heading = (
    <span className="flex items-center gap-2">
      <span aria-hidden="true">{icon}</span>
      {fetchLink ? (
        <a href={fetchLink.href} target="_blank" rel="noopener noreferrer">
          {label}
        </a>
      ) : (
        <span className="min-w-0 break-words">{label}</span>
      )}
      {inProgress && <Spinner spinnerSize={SpinnerSize.sm} />}
    </span>
  );

  const resultList = results && results.length > 0 && (
    <ul className="mt-1 ml-7 list-none space-y-1 p-0 text-xs">
      {results.map((result, index) => {
        const link = safeResearchUrl(result.url);
        return (
          <li key={`${result.url}-${index}`} className="break-words">
            {link ? (
              <a href={link.href} target="_blank" rel="noopener noreferrer">
                {result.title || link.domain}
              </a>
            ) : (
              <span>{result.title || result.url}</span>
            )}
            {link && <span className="ml-1 text-slate-500">{link.domain}</span>}
            {result.pageAge && (
              <span className="ml-1 text-slate-500">· {result.pageAge}</span>
            )}
          </li>
        );
      })}
    </ul>
  );

  return (
    <li className="my-1 text-sm">
      {resultList ? (
        <details>
          <summary className="cursor-pointer">{heading}</summary>
          {resultList}
        </details>
      ) : (
        heading
      )}
    </li>
  );
}

export default function ResearchSteps({ blocks }: { blocks: ResearchBlock[] }) {
  const steps = groupSteps(blocks);
  const active = steps.some(
    (step) =>
      step.use?.status === "in_progress" &&
      !step.searchResult?.errorCode &&
      !step.fetchResult?.errorCode,
  );

  return (
    <details className="my-4 rounded-md border border-slate-200 bg-slate-50 p-4 dark:border-slate-600 dark:bg-slate-700">
      <summary className="flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300">
        Research · {steps.length} {steps.length === 1 ? "step" : "steps"}
        {active && <Spinner spinnerSize={SpinnerSize.sm} />}
      </summary>
      <ol className="mt-3 mb-0 list-none space-y-2 p-0">
        {steps.map((step) => (
          <ResearchStepRow key={step.id} step={step} />
        ))}
      </ol>
    </details>
  );
}
