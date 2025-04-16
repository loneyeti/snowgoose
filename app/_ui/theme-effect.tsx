"use client";

import { useTheme } from "next-themes";
import { useEffect } from "react";

export function ThemeEffect({ initialTheme }: { initialTheme: string }) {
  const { setTheme } = useTheme();

  // Apply the theme immediately during first render
  useEffect(() => {
    // Set the HTML class immediately to prevent flash
    if (
      initialTheme === "dark" ||
      (initialTheme === "system" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches)
    ) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    // Let next-themes take over after that
    setTheme(initialTheme);
  }, [initialTheme, setTheme]);

  return null;
}
