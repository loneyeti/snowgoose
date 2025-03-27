import { useState, useEffect } from "react";
import { OutputFormat } from "../../../_lib/model";

interface UseOutputFormatStateProps {
  outputFormats: OutputFormat[];
  initialOutputFormatId?: number;
}

export function useOutputFormatState({
  outputFormats,
  initialOutputFormatId,
}: UseOutputFormatStateProps) {
  const [selectedOutputFormat, setSelectedOutputFormat] = useState<
    number | undefined
  >(
    initialOutputFormatId !== undefined
      ? initialOutputFormatId
      : outputFormats.length > 0
        ? outputFormats[0].id
        : undefined
  );

  useEffect(() => {
    if (initialOutputFormatId !== undefined) {
      setSelectedOutputFormat(initialOutputFormatId);
    }
  }, [initialOutputFormatId]);

  const updateSelectedOutputFormat = (formatId: string | number) => {
    const id = typeof formatId === "string" ? parseInt(formatId) : formatId;
    setSelectedOutputFormat(id);
  };

  return {
    selectedOutputFormat,
    updateSelectedOutputFormat,
  };
}
