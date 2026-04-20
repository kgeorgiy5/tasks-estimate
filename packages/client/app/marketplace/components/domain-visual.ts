import { ProjectIcon as ProjectIconType } from "@tasks-estimate/shared";

import { DomainVisual } from "./workflow-card";

const fallbackDomainVisual: DomainVisual = {
  icon: "brush",
  color: "#e4e4e7",
};

const domainVisualMap: Record<string, DomainVisual> = {
  personal: {
    icon: "pen",
    color: "#dbeafe",
  },
  "software development": {
    icon: "gears",
    color: "#d1fae5",
  },
  marketing: {
    icon: "bill",
    color: "#fed7aa",
  },
  sales: {
    icon: "bill",
    color: "#fecdd3",
  },
  design: {
    icon: "pen",
    color: "#e9d5ff",
  },
  operations: {
    icon: "gears",
    color: "#c7d2fe",
  },
  finance: {
    icon: "bill",
    color: "#fde68a",
  },
};

/**
 * Gets icon and background color for a workflow domain.
 */
export function getDomainVisual(domain: string): DomainVisual {
  return domainVisualMap[domain] ?? fallbackDomainVisual;
}

/**
 * Returns visual for a custom card icon.
 */
export function getCustomVisual(icon: ProjectIconType, color: string): DomainVisual {
  return { icon, color };
}
