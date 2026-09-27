import assert from "node:assert/strict";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import type { ContentBlock, ServerToolUseBlock } from "@/app/_lib/model";
import { mergeStreamContent } from "./merge-stream-content";
import ResearchSteps from "./research-steps";
import SourcesList from "./sources-list";

test("citation-only chunks stay with text after a research step", () => {
  const before: ContentBlock[] = [
    { type: "text", text: "Before search." },
    {
      type: "server_tool_use",
      id: "step-1",
      name: "web_search",
      input: '{"query":"news"}',
      status: "completed",
      vendor: "anthropic",
    },
  ];
  const citation = {
    type: "url_citation" as const,
    url: "https://example.com/story",
    vendor: "anthropic" as const,
  };
  const withCitation = mergeStreamContent(before, {
    type: "text",
    text: "",
    citations: [citation],
  });
  const after = mergeStreamContent(withCitation, {
    type: "text",
    text: "After search.",
  });

  assert.deepEqual(after[0], before[0]);
  assert.deepEqual(after[2], {
    type: "text",
    text: "After search.",
    citations: [citation],
  });
  assert.equal(before.length, 2);
});

test("research steps and results update by id and keep Claude raw data", () => {
  const startedBlock: ServerToolUseBlock = {
    type: "server_tool_use",
    id: "step-1",
    name: "web_search",
    input: "{}",
    status: "in_progress",
    vendor: "openai",
  };
  const started: ContentBlock[] = [startedBlock];
  const completed = mergeStreamContent(started, {
    ...startedBlock,
    input: '{"query":"news"}',
    status: "completed",
  });
  assert.equal(completed.length, 1);
  assert.equal(
    started[0].type === "server_tool_use" && started[0].status,
    "in_progress",
  );

  const raw = { encrypted_content: "opaque" };
  const result = mergeStreamContent(completed, {
    type: "web_search_tool_result",
    toolUseId: "step-1",
    results: [{ url: "https://example.com" }],
    vendor: "anthropic",
    raw,
  });
  const repeated = mergeStreamContent(result, {
    type: "web_search_tool_result",
    toolUseId: "step-1",
    results: [{ url: "https://example.com", title: "Example" }],
    vendor: "anthropic",
  });
  assert.equal(repeated.length, 2);
  assert.equal(
    repeated[1].type === "web_search_tool_result" && repeated[1].raw,
    raw,
  );
});

test("research and source links use only web URLs", () => {
  const panel = renderToStaticMarkup(
    <ResearchSteps
      blocks={[
        {
          type: "server_tool_use",
          id: "step-1",
          name: "web_search",
          input: '{"query":"news"}',
          status: "completed",
          vendor: "anthropic",
        },
        {
          type: "web_search_tool_result",
          toolUseId: "step-1",
          results: [
            {
              url: "https://example.com/story",
              title: "Example",
              pageAge: "1 day",
            },
            { url: "javascript:alert(1)", title: "Unsafe" },
          ],
          vendor: "anthropic",
        },
      ]}
    />,
  );
  assert.match(panel, /Searched news · 2 results/);
  assert.match(panel, /https:\/\/example\.com\/story/);
  assert.doesNotMatch(panel, /href="javascript:/);

  const sources = renderToStaticMarkup(
    <SourcesList
      blocks={[
        {
          type: "text",
          text: "First",
          citations: [
            {
              type: "url_citation",
              url: "https://example.com/story",
              vendor: "anthropic",
            },
          ],
        },
        {
          type: "text",
          text: "Second",
          citations: [
            {
              type: "url_citation",
              url: "https://example.com/story",
              title: "Story",
              citedText: "Quoted text",
              vendor: "anthropic",
            },
            {
              type: "url_citation",
              url: "javascript:alert(1)",
              vendor: "anthropic",
            },
          ],
        },
      ]}
    />,
  );
  assert.equal((sources.match(/href=/g) ?? []).length, 1);
  assert.match(sources, /Quoted text/);
  assert.doesNotMatch(sources, /javascript:/);
});
