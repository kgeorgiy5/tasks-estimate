"use client";

import { ListMarketplaceWorkflowDto, ProjectIcon as ProjectIconType } from "@tasks-estimate/shared";
import { ProjectIcon } from "@/components/project-icon";
import { Button } from "@/components/ui/button";

type DomainVisual = Readonly<{
  icon: ProjectIconType;
  color: string;
}>;

/**
 * Formats a title so it starts with an uppercase letter.
 */
function formatTitle(title: string): string {
  if (!title || title.length === 0) return title;
  return `${title[0].toUpperCase()}${title.slice(1)}`;
}

/**
 * Props for WorkflowCard component.
 */
export type WorkflowCardProps = Readonly<{
  workflow: ListMarketplaceWorkflowDto[number];
  visual: DomainVisual;
}>;

/**
 * Renders a single marketplace workflow card.
 */
export function WorkflowCard({ workflow, visual }: WorkflowCardProps) {
  return (
    <article className="flex min-h-117.5 flex-col rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex-1">
        <div className="mb-4 aspect-square w-full overflow-hidden rounded-2xl bg-zinc-100 dark:bg-zinc-800">
          <ProjectIcon
            icon={visual.icon}
            color={visual.color}
            className="h-full w-full rounded-xl"
            iconClassName="h-24 w-24"
          />
        </div>

        <h2 className="text-2xl font-semibold leading-tight">
          {formatTitle(workflow.title)}
        </h2>

        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
          {workflow.description}
        </p>
      </div>

      <Button type="button" className="mt-4 h-12 w-full text-base font-semibold">
        Apply the workflow
      </Button>
    </article>
  );
}

export default WorkflowCard;
