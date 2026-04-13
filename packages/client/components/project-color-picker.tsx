"use client";

import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const COLORS = [
  "#F97316", // orange
  "#06B6D4", // cyan
  "#10B981", // green
  "#EF4444", // red
  "#8B5CF6", // purple
  "#F59E0B", // amber
  "#D1D5DB", // light-gray
];

type ProjectColorPickerProps = Readonly<{
  value?: string | null;
  onChange: (value?: string) => void;
  disabled?: boolean;
}>;

export function ProjectColorPicker({ value, onChange, disabled }: ProjectColorPickerProps) {
  const [open, setOpen] = useState(false);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="h-8 w-10 p-1" disabled={disabled} aria-label="Select color">
          <span className="flex items-center justify-center">
            {value ? (
              <span className="inline-block h-4 w-4 rounded-full" style={{ backgroundColor: value }} />
            ) : (
              <span className="text-xs text-muted-foreground">—</span>
            )}
          </span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent sideOffset={6} className="w-40 p-2">
        <div className="grid grid-cols-4 gap-2">
          <button
            type="button"
            onClick={() => {
              onChange(undefined);
              setOpen(false);
            }}
            className="h-7 w-7 rounded border flex items-center justify-center"
            aria-label="No color"
          >
            —
          </button>
          {COLORS.map((c) => (
            <button
              key={c}
              type="button"
              className="h-7 w-7 rounded"
              onClick={() => {
                onChange(c);
                setOpen(false);
              }}
              aria-label={c}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
