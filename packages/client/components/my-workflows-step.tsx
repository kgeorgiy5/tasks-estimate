"use client";

import { UseQueryResult } from "@tanstack/react-query";
import { ListUserWorkflowsDto, ListUserWorkflowDto } from "@tasks-estimate/shared";
import { getDomainVisual, WorkflowCard } from "@/app/marketplace/components";
import type { SelectedWorkflow } from "../types/create-project";

export function MyWorkflowsStep({
  query,
  workflows,
  selectedWorkflow,
  setSelectedWorkflow,
  createMutationPending,
  onOpenMarketplace,
}: {
  query: UseQueryResult<ListUserWorkflowsDto, unknown>;
  workflows: ListUserWorkflowsDto;
  selectedWorkflow: SelectedWorkflow | null;
  setSelectedWorkflow: (sw: SelectedWorkflow | null) => void;
  createMutationPending: boolean;
  onOpenMarketplace: () => void;
}) {
  const hasWorkflows = workflows.length > 0;

  return (
    <div className="space-y-3">
      <p className="text-sm text-zinc-600 dark:text-zinc-300">
        Select one of your workflows or import from marketplace.
      </p>

      {query.isLoading && <p className="text-sm text-zinc-600 dark:text-zinc-300">Loading your workflows...</p>}
      {query.isError && <p className="text-sm text-destructive">Failed to load your workflows.</p>}

      {hasWorkflows && (
        <div className="overflow-x-auto max-w-full hide-scrollbar">
          <div className="flex w-max gap-4 pb-2">
            {workflows.map((workflow: ListUserWorkflowDto) => {
              const isSelected =
                selectedWorkflow?.source === "my" && selectedWorkflow.workflow._id === workflow._id;

              return (
                <WorkflowCard
                  key={workflow._id}
                  workflow={workflow}
                  visual={getDomainVisual(workflow.domain)}
                  actionLabel={isSelected ? "Selected" : "Use this workflow"}
                  onAction={() => setSelectedWorkflow({ source: "my", workflow })}
                  disabled={createMutationPending}
                  selected={isSelected}
                  className="w-80 min-w-80"
                />
              );
            })}
          </div>
        </div>
      )}

      {!hasWorkflows && query.isSuccess && (
        <p className="text-sm text-zinc-600 dark:text-zinc-300">You do not have your own workflows yet.</p>
      )}

      <button
        type="button"
        onClick={onOpenMarketplace}
        disabled={createMutationPending}
        className="cursor-pointer text-primary underline underline-offset-2 hover:text-primary/80 disabled:opacity-50"
      >
        Import marketplace workflow
      </button>
    </div>
  );
}
