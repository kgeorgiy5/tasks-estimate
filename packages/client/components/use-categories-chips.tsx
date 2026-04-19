"use client";

import { useState } from "react";

/**
 * Hook providing shared behavior for categories chips components.
 *
 * @param categories Current categories array
 * @param onChange Callback invoked with next categories array
 * @returns Handlers and input state for categories UI
 */
export function useCategoriesChips(
  categories: string[],
  onChange: (next: string[]) => void,
) {
  const [input, setInput] = useState("");

  const handleAdd = (value?: string) => {
    const v = (value ?? input).trim();
    if (!v) return;
    if (!categories.includes(v)) {
      onChange([...categories, v]);
    }
    setInput("");
  };

  const handleRemove = (cat: string) => {
    onChange(categories.filter((c) => c !== cat));
  };

  return { input, setInput, handleAdd, handleRemove } as const;
}
