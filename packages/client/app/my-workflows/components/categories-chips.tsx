"use client";

import { FC } from "react";
import { useCategoriesChips } from "@/components/use-categories-chips";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useT } from "@/i18n";

/**
 * CategoriesChips props
 */
export type CategoriesChipsProps = {
  categories: string[];
  onChange: (next: string[]) => void;
  disabled?: boolean;
  showAdd?: boolean;
};

/**
 * Renders category chips with remove buttons and an input to add categories.
 */
export const CategoriesChips: FC<CategoriesChipsProps> = ({
  categories,
  onChange,
  disabled = false,
  showAdd = true,
}) => {
  const { input, setInput, handleAdd, handleRemove } = useCategoriesChips(
    categories,
    onChange,
  );
  const { t } = useT();

  return (
    <div>
      <div className="flex flex-wrap gap-2 pr-1">
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
              className="text-zinc-500 hover:text-zinc-800"
            >
              ×
            </button>
          </span>
        ))}
      </div>

      {showAdd && (
          <div className="mt-2 flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
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
      )}
    </div>
  );
};
