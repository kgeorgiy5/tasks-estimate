"use client";

import { renderIconByKey } from "./project-icon-picker";
import type { ProjectIcon as ProjectIconType } from "@tasks-estimate/shared";

type ProjectIconProps = Readonly<{
  icon?: ProjectIconType | null;
  color?: string | null;
  className?: string;
  iconClassName?: string;
}>;

export function ProjectIcon({ icon, color, className, iconClassName }: ProjectIconProps) {
  const style: Record<string, string> = { color: "black" };
  if (color) style.backgroundColor = color;

  return (
    <span
      className={`inline-flex items-center justify-center rounded-md shrink-0 ${className ?? "h-8 w-8"}`}
      style={style}
      aria-hidden
    >
      {icon ? (
        renderIconByKey(icon, iconClassName ?? "h-4 w-4", false)
      ) : (
        <span className="text-xs text-muted-foreground">—</span>
      )}
    </span>
  );
}
