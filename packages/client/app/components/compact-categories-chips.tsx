"use client";

import { FC, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

/**
 * CategoriesChips props
 */
export type CompactCategoriesChipsProps = {
  categories: string[];
  onChange: (next: string[]) => void;
  disabled?: boolean;
};

/**
 * Renders category chips with remove buttons and an input to add categories.
 */
export const CompactCategoriesChips: FC<CompactCategoriesChipsProps> = ({
  categories,
  onChange,
  disabled = false,
}) => {
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

  return (
    <>
      {categories.map((cat) => (
        <span
          key={cat}
          className="inline-flex items-center gap-2 rounded-full bg-zinc-100 px-2 py-1 text-xs"
        >
          <span>{cat}</span>
          <button
            type="button"
            aria-label={`Remove ${cat}`}
            onClick={() => handleRemove(cat)}
            className="text-zinc-500 hover:text-zinc-800"
          >
            ×
          </button>
        </span>
      ))}

      <div className="inline-flex w-fit gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="w-50"
          placeholder="Add category"
          disabled={disabled}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleAdd();
            }
          }}
        />
        <Button type="button" onClick={() => handleAdd()} disabled={disabled}>
          Add
        </Button>
      </div>
    </>
  );
};
