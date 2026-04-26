"use client";

import { UseQueryResult } from "@tanstack/react-query";
import { ListMarketplaceWorkflowDto } from "@tasks-estimate/shared";
import { getDomainVisual, WorkflowCard } from "@/app/marketplace/components";
import { useT } from "@/i18n";
import type { SelectedWorkflow } from "../types/create-project";

export function MarketplaceStep({
  query,
  workflows,
  selectedWorkflow,
  setSelectedWorkflow,
  createMutationPending,
}: Readonly<{
  query: UseQueryResult<ListMarketplaceWorkflowDto, unknown>;
  workflows: ListMarketplaceWorkflowDto;
  selectedWorkflow: SelectedWorkflow | null;
  setSelectedWorkflow: (sw: SelectedWorkflow | null) => void;
  createMutationPending: boolean;
}>) {
  const { t } = useT();
  return (
    <div className="space-y-3">
      <p className="text-sm text-zinc-600 dark:text-zinc-300">{t("MARKETPLACE_STEP.DESCRIPTION")}</p>

      {query.isLoading && <p className="text-sm text-zinc-600 dark:text-zinc-300">{t("MARKETPLACE_STEP.LOADING")}</p>}
      {query.isError && <p className="text-sm text-destructive">{t("MARKETPLACE_STEP.FAILED")}</p>}

      {workflows.length > 0 && (
        <div className="overflow-x-auto hide-scrollbar max-w-full">
          <div className="flex w-max gap-4 pb-2">
            {workflows.map((workflow) => {
              const isSelected = selectedWorkflow?.source === "marketplace" && selectedWorkflow.workflow._id === workflow._id;

              return (
                <WorkflowCard
                  key={workflow._id}
                  workflow={workflow}
                  visual={getDomainVisual(workflow.domain)}
                  actionLabel={isSelected ? t("MARKETPLACE_STEP.SELECTED") : t("MARKETPLACE_STEP.USE_WORKFLOW")}
                  onAction={() => setSelectedWorkflow({ source: "marketplace", workflow })}
                  disabled={createMutationPending}
                  selected={isSelected}
                  className="w-80 min-w-80"
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
