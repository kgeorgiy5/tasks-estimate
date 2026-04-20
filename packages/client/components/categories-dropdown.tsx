"use client";

import { FC, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from "@/components/ui/dropdown-menu";
import { listWorkflowCategories } from "@/api/workflows/workflows-handlers";
import { CategoriesChips } from "../app/my-workflows/components/categories-chips";
import { cn } from "@/lib/utils";

export type CategoriesDropdownProps = {
  projectId?: string;
  selected: string[];
  onChange: (next: string[]) => void;
  disabled?: boolean;
  className?: string;
};

export const CategoriesDropdown: FC<CategoriesDropdownProps> = ({
  projectId,
  selected,
  onChange,
  disabled = false,
  className,
}) => {
  const [open, setOpen] = useState(false);

  const categoriesQuery = useQuery({
    queryKey: ["workflow-categories", projectId],
    queryFn: () => listWorkflowCategories(projectId ?? ""),
    enabled: !!projectId,
    staleTime: 60_000,
  });

  const available = categoriesQuery.data ?? [];

  const toggle = (cat: string) => {
    if (selected.includes(cat)) {
      onChange(selected.filter((c) => c !== cat));
    } else {
      onChange([...selected, cat]);
    }
  };

  const handleAdd = (cats: string[]) => {
    onChange(cats);
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled || !projectId}
          className={cn("", className)}
        >
          {selected.length > 0
            ? `Categories (${selected.length})`
            : "Categories"}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className="w-[40vw] max-h-[50vh] bg-white p-3">
        <div className="flex flex-wrap gap-2">
          {categoriesQuery.isLoading ? (
            <div className="text-sm text-zinc-600">Loading…</div>
          ) : available.length === 0 ? (
            <div className="text-sm text-zinc-600">No categories</div>
          ) : (
            available.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => toggle(cat)}
                className={`inline-flex items-center gap-2 rounded-full px-2 py-1 text-xs ${
                  selected.includes(cat)
                    ? "bg-blue-100 text-blue-800"
                    : "bg-zinc-100 text-zinc-800"
                }`}
              >
                <span>{cat}</span>
              </button>
            ))
          )}
        </div>

        <div className="mt-3">
          <CategoriesChips
            categories={selected}
            onChange={handleAdd}
            disabled={disabled}
            showAdd={false}
          />
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
