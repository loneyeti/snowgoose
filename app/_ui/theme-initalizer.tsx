"use client";

import { useTheme } from "next-themes";
import { useEffect } from "react";

export function ThemeInitializer({ initialTheme }: { initialTheme: string }) {
  const { setTheme } = useTheme();

  useEffect(() => {
    setTheme(initialTheme);
  }, [initialTheme, setTheme]);

  return null;
}
