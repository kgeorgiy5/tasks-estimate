"use client";

import { useState } from "react";
import type { ProjectIcon } from "@tasks-estimate/shared";
import { HugeiconsIcon } from "@hugeicons/react";
import * as HIcons from "@hugeicons/core-free-icons";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const ICON_NAME_MAP: Record<string, string> = {
  gears: "AiSettingIcon",
  book: "AiBookIcon",
  pen: "AiEditingIcon",
  bill: "AddInvoiceIcon",
  bag: "ArchiveIcon",
  hospital: "AmbulanceIcon",
  burger: "ApplePieIcon",
  carrot: "CarrotIcon",
  brush: "AiEraserIcon",
  screen: "AiComputerIcon",
  phone: "AiPhone01Icon",
  dog: "DogIcon",
  cat: "CatIcon",
};

export function renderIconByKey(key: ProjectIcon | string, className?: string, forceWhite = false) {
  const name = ICON_NAME_MAP[key];
  // @ts-expect-error dynamic lookup
  const icon = HIcons[name];
  if (icon) {
    const style = forceWhite ? { color: "white", stroke: "white", fill: "white" } : undefined;
    return (
      <HugeiconsIcon
        icon={icon}
        className={className ?? "h-4 w-4"}
        strokeWidth={2}
        style={style}
      />
    );
  }
  return null;
}


type ProjectIconPickerProps = Readonly<{
  value?: ProjectIcon | null;
  onChange: (value?: ProjectIcon) => void;
  disabled?: boolean;
}>;

export function ProjectIconPicker({ value, onChange, disabled }: ProjectIconPickerProps) {
  const [open, setOpen] = useState(false);

  const handleSelect = (key?: ProjectIcon) => {
    onChange(key ?? undefined);
    setOpen(false);
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="h-8 w-10 p-1" disabled={disabled} aria-label="Select icon">
          <span className="flex items-center justify-center">{value ? renderIconByKey(value) ?? "" : "—"}</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent sideOffset={6} className="w-40 p-2">
        <div className="grid grid-cols-4 gap-2">
          <button key="" onClick={() => handleSelect()} className="rounded p-1 text-sm hover:bg-accent/10">
            —
          </button>
          {Object.keys(ICON_NAME_MAP).map((k) => (
            <button
              key={k}
              onClick={() => handleSelect(k as ProjectIcon)}
              className="rounded p-1 text-sm hover:bg-accent/10 flex items-center justify-center"
              aria-label={k}
            >
              {renderIconByKey(k)}
            </button>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
