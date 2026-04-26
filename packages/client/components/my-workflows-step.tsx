"use client";

import { UseQueryResult } from "@tanstack/react-query";
import { ListUserWorkflowsDto, ListUserWorkflowDto } from "@tasks-estimate/shared";
import { getDomainVisual, WorkflowCard } from "@/app/marketplace/components";
import type { SelectedWorkflow } from "../types/create-project";
import { useT } from "@/i18n";

export function MyWorkflowsStep({
  query,
  workflows,
  selectedWorkflow,
  setSelectedWorkflow,
  createMutationPending,
  onOpenMarketplace,
}: Readonly<{
  query: UseQueryResult<ListUserWorkflowsDto, unknown>;
  workflows: ListUserWorkflowsDto;
  selectedWorkflow: SelectedWorkflow | null;
  setSelectedWorkflow: (sw: SelectedWorkflow | null) => void;
  createMutationPending: boolean;
  onOpenMarketplace: () => void;
}>) {
  const { t } = useT();
  const hasWorkflows = workflows.length > 0;

  return (
    <div className="space-y-3">
      <p className="text-sm text-zinc-600 dark:text-zinc-300">{t("MY_WORKFLOWS_STEP.DESCRIPTION")}</p>

      {query.isLoading && <p className="text-sm text-zinc-600 dark:text-zinc-300">{t("MY_WORKFLOWS_STEP.LOADING")}</p>}
      {query.isError && <p className="text-sm text-destructive">{t("MY_WORKFLOWS_STEP.FAILED")}</p>}

      {hasWorkflows && (
        <div className="overflow-x-auto max-w-full hide-scrollbar">
          <div className="flex w-max gap-4 pb-2">
            {workflows.map((workflow: ListUserWorkflowDto) => {
              const isSelected = selectedWorkflow?.source === "my" && selectedWorkflow.workflow._id === workflow._id;

              return (
                <WorkflowCard
                  key={workflow._id}
                  workflow={workflow}
                  visual={getDomainVisual(workflow.domain)}
                  actionLabel={isSelected ? t("MY_WORKFLOWS_STEP.SELECTED") : t("MY_WORKFLOWS_STEP.USE_WORKFLOW")}
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
        <p className="text-sm text-zinc-600 dark:text-zinc-300">{t("MY_WORKFLOWS_STEP.NO_WORKFLOWS")}</p>
      )}

      <button
        type="button"
        onClick={onOpenMarketplace}
        disabled={createMutationPending}
        className="cursor-pointer text-primary underline underline-offset-2 hover:text-primary/80 disabled:opacity-50"
      >
        {t("MY_WORKFLOWS_STEP.IMPORT")}
      </button>
    </div>
  );
}
