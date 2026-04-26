"use client";

import { useQuery } from "@tanstack/react-query";
import { ListMarketplaceWorkflowDto } from "@tasks-estimate/shared";
import { useRouter, useSearchParams } from "next/navigation";
import { ProjectIcon } from "@/components/project-icon";
import { Button } from "@/components/ui/button";
import { NavigationPaths } from "@/config";
import { cn } from "@/lib/utils";
import {
  listMarketplaceDomains,
  listMarketplaceWorkflows,
} from "@/api/workflows/workflows-handlers";
import { getDomainVisual, WorkflowCard } from "./components";
import { CreateProjectDialog } from "@/components/index";
import { useState } from "react";
import { useT } from "@/i18n";

/**
 * Formats a domain key to a readable title.
 */
function formatDomainLabel(domain: string): string {
  return domain
    .split(" ")
    .map((part) => {
      if (!part) {
        return part;
      }

      return `${part[0].toUpperCase()}${part.slice(1)}`;
    })
    .join(" ");
}

/**
 * Renders workflow marketplace with domain filters synced to query params.
 */
export default function MarketplacePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedDomain = searchParams?.get("domain") ?? undefined;

  const domainsQuery = useQuery<string[]>({
    queryKey: ["marketplace-domains"],
    queryFn: () => listMarketplaceDomains(),
  });

  const workflowsQuery = useQuery<ListMarketplaceWorkflowDto>({
    queryKey: ["marketplace-workflows", selectedDomain ?? "all"],
    queryFn: () => listMarketplaceWorkflows(selectedDomain),
  });

  /**
   * Persists the selected domain in URL search params.
   */
  const selectDomain = (domain?: string) => {
    const params = new URLSearchParams(searchParams?.toString() ?? "");

    if (domain) {
      params.set("domain", domain);
    } else {
      params.delete("domain");
    }

    const queryString = params.toString();
    const url = queryString.length
      ? `${NavigationPaths.MARKETPLACE}?${queryString}`
      : NavigationPaths.MARKETPLACE;

    router.replace(url);
  };

  const workflows = workflowsQuery.data ?? [];
  const domains = domainsQuery.data ?? [];
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedMarketplaceWorkflow, setSelectedMarketplaceWorkflow] =
    useState<null | ListMarketplaceWorkflowDto[number]>(null);

  const { t } = useT();

  return (
    <div className="flex h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="h-screen w-full max-w-[80vw] overflow-hidden bg-white dark:bg-black">
        <section className="h-[20%] min-h-38 border-b border-zinc-200 px-6 py-5 dark:border-zinc-800">
          <h1 className="text-2xl font-semibold">{t("MARKETPLACE_PAGE.TITLE")}</h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
            {t("MARKETPLACE_PAGE.DESCRIPTION")}
          </p>

          <div className="mt-4 overflow-x-auto hide-scrollbar">
            <div className="flex w-max gap-3 pb-2">
              <Button
                type="button"
                variant={selectedDomain ? "outline" : "default"}
                className="h-14 min-w-55 justify-start rounded-xl px-4 text-base font-semibold"
                onClick={() => selectDomain()}
              >
                {t("MARKETPLACE_PAGE.ALL_DOMAINS")}
              </Button>

              {domains.map((domain) => {
                const visual = getDomainVisual(domain);
                const isSelected = selectedDomain === domain;

                return (
                  <Button
                    key={domain}
                    type="button"
                    variant={isSelected ? "default" : "outline"}
                    className={cn(
                      "h-14 min-w-55 justify-start gap-3 rounded-xl px-3 text-base font-semibold",
                    )}
                    onClick={() => selectDomain(domain)}
                  >
                    <ProjectIcon
                      icon={visual.icon}
                      color={visual.color}
                      className="h-9 w-9 rounded-md"
                      iconClassName="h-4 w-4"
                    />
                    {formatDomainLabel(domain)}
                  </Button>
                );
              })}
            </div>
          </div>
        </section>

        <section className="h-[80%] overflow-y-auto p-6">
          {workflowsQuery.isLoading ? (
            <div className="text-sm text-zinc-600 dark:text-zinc-300">
              {t("MARKETPLACE_PAGE.LOADING_WORKFLOWS")}
            </div>
          ) : null}

          {workflowsQuery.isError ? (
            <div className="text-sm text-red-700 dark:text-red-300">
              {t("MARKETPLACE_PAGE.FAILED")}
            </div>
          ) : null}

          {!workflowsQuery.isLoading && !workflowsQuery.isError ? (
            <div className="grid grid-cols-1 gap-5 pb-8 md:grid-cols-2 xl:grid-cols-3">
              {workflows.map((workflow) => {
                const visual = getDomainVisual(workflow.domain);

                return (
                  <WorkflowCard
                    key={workflow._id}
                    workflow={workflow}
                    visual={visual}
                      actionLabel={t("MARKETPLACE_PAGE.APPLY")}
                    onAction={() => {
                      setSelectedMarketplaceWorkflow(workflow);
                      setCreateOpen(true);
                    }}
                  />
                );
              })}
            </div>
          ) : null}
        </section>
        <CreateProjectDialog
          open={createOpen}
          onOpenChange={(v) => {
            setCreateOpen(v);
            if (!v) setSelectedMarketplaceWorkflow(null);
          }}
          initialSelectedWorkflow={
            selectedMarketplaceWorkflow
              ? { source: "marketplace", workflow: selectedMarketplaceWorkflow }
              : null
          }
          initialStep={"marketplace"}
        />
      </main>
    </div>
  );
}
