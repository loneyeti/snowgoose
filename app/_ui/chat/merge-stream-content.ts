import type { ContentBlock } from "@/app/_lib/model";

function replaceBlock(
  content: ContentBlock[],
  index: number,
  block: ContentBlock,
): ContentBlock[] {
  const next = [...content];
  next[index] = block;
  return next;
}

/** Merge streaming updates without copying every earlier research result. */
export function mergeStreamContent(
  content: ContentBlock[],
  chunk: ContentBlock,
): ContentBlock[] {
  const lastIndex = content.length - 1;
  const lastBlock = content[lastIndex];

  switch (chunk.type) {
    case "text":
      if (!chunk.text && !chunk.citations?.length) return content;
      if (lastBlock?.type === "text") {
        return replaceBlock(content, lastIndex, {
          ...lastBlock,
          text: lastBlock.text + chunk.text,
          ...(chunk.citations?.length && {
            citations: [...(lastBlock.citations ?? []), ...chunk.citations],
          }),
        });
      }
      // A citation can arrive before the first text delta after a tool result.
      // Keep it with that upcoming text, not an older pre-search paragraph.
      return [...content, chunk];

    case "thinking":
      if (lastBlock?.type === "thinking") {
        return replaceBlock(content, lastIndex, {
          ...lastBlock,
          thinking: lastBlock.thinking + chunk.thinking,
          signature: lastBlock.signature + (chunk.signature ?? ""),
        });
      }
      return [...content, chunk];

    case "server_tool_use": {
      const index = content.findIndex(
        (block) => block.type === "server_tool_use" && block.id === chunk.id,
      );
      return index < 0
        ? [...content, chunk]
        : replaceBlock(content, index, chunk);
    }

    case "web_search_tool_result":
    case "web_fetch_tool_result": {
      const index = content.findIndex(
        (block) =>
          block.type === chunk.type && block.toolUseId === chunk.toolUseId,
      );
      if (index < 0) return [...content, chunk];
      const previous = content[index];
      return replaceBlock(content, index, {
        ...previous,
        ...chunk,
        raw: chunk.raw ?? ("raw" in previous ? previous.raw : undefined),
      });
    }

    case "image_data": {
      const index = chunk.id
        ? content.findIndex(
            (block) => block.type === "image_data" && block.id === chunk.id,
          )
        : content.findLastIndex((block) => block.type === "image_data");
      return index < 0
        ? [...content, chunk]
        : replaceBlock(content, index, chunk);
    }

    case "image": {
      const index = chunk.generationId
        ? content.findIndex(
            (block) =>
              block.type === "image_data" && block.id === chunk.generationId,
          )
        : -1;
      return index < 0
        ? [...content, chunk]
        : replaceBlock(content, index, chunk);
    }

    default:
      return [...content, chunk];
  }
}
