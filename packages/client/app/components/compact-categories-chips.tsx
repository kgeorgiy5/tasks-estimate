"use client";

import type { FC } from "react";
import { useCategoriesChips } from "@/components/use-categories-chips";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useT } from "@/i18n";

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
  const { t } = useT();
  const { input, setInput, handleAdd, handleRemove } = useCategoriesChips(
    categories,
    onChange,
  );

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
            aria-label={t("CATEGORIES_CHIPS.REMOVE", { name: cat })}
            onClick={() => handleRemove(cat)}
            disabled={disabled}
            className="text-zinc-500 hover:text-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
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
          placeholder={t("CATEGORIES_CHIPS.PLACEHOLDER")}
          disabled={disabled}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleAdd();
            }
          }}
        />
        <Button type="button" onClick={() => handleAdd()} disabled={disabled}>
          {t("CATEGORIES_CHIPS.ADD")}
        </Button>
      </div>
    </>
  );
};
