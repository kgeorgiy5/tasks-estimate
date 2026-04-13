"use client";

import { useQuery } from "@tanstack/react-query";
import {
  ListMarketplaceWorkflowDto,
  ProjectIcon as ProjectIconType,
} from "@tasks-estimate/shared";
import { useRouter, useSearchParams } from "next/navigation";
import { listMarketplaceDomains, listMarketplaceWorkflows } from "@/api";
import { ProjectIcon } from "@/components/project-icon";
import { Button } from "@/components/ui/button";
import { NavigationPaths } from "@/config";
import { cn } from "@/lib/utils";

type DomainVisual = Readonly<{
  icon: ProjectIconType;
  color: string;
}>;

const fallbackDomainVisual: DomainVisual = {
  icon: "bag",
  color: "#e4e4e7",
};

const domainVisualMap: Record<string, DomainVisual> = {
  personal: {
    icon: "book",
    color: "#dbeafe",
  },
  "software development": {
    icon: "screen",
    color: "#d1fae5",
  },
  marketing: {
    icon: "pen",
    color: "#fed7aa",
  },
  sales: {
    icon: "bill",
    color: "#fecdd3",
  },
  design: {
    icon: "brush",
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
 * Gets icon and background color for a domain.
 */
function getDomainVisual(domain: string): DomainVisual {
  return domainVisualMap[domain] ?? fallbackDomainVisual;
}

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
 * Ensures workflow title starts with an uppercase letter.
 */
function formatTitle(title: string): string {
  if (!title || title.length === 0) return title;
  return `${title[0].toUpperCase()}${title.slice(1)}`;
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

  return (
    <div className="flex h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="h-screen w-full max-w-[80vw] overflow-hidden bg-white dark:bg-black">
        <section className="h-[20%] min-h-[9.5rem] border-b border-zinc-200 px-6 py-5 dark:border-zinc-800">
          <h1 className="text-2xl font-semibold">Marketplace</h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
            Browse workflows by domain
          </p>

          <div className="mt-4 overflow-x-auto">
            <div className="flex w-max gap-3 pb-2">
              <Button
                type="button"
                variant={selectedDomain ? "outline" : "default"}
                className="h-14 min-w-[220px] justify-start rounded-xl px-4 text-base font-semibold"
                onClick={() => selectDomain()}
              >
                All domains
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
                      "h-14 min-w-[220px] justify-start gap-3 rounded-xl px-3 text-base font-semibold",
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
              Loading workflows...
            </div>
          ) : null}

          {workflowsQuery.isError ? (
            <div className="text-sm text-red-700 dark:text-red-300">
              Failed to load marketplace workflows.
            </div>
          ) : null}

          {!workflowsQuery.isLoading && !workflowsQuery.isError ? (
            <div className="grid grid-cols-1 gap-5 pb-8 md:grid-cols-2 xl:grid-cols-3">
              {workflows.map((workflow) => {
                const visual = getDomainVisual(workflow.domain);

                return (
                  <article
                    key={workflow._id}
                    className="flex min-h-[470px] flex-col rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900"
                  >
                    <div className="flex-1">
                      <div className="mb-4 aspect-square w-full overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-100 p-4 dark:border-zinc-700 dark:bg-zinc-800">
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
              })}
            </div>
          ) : null}
        </section>
      </main>
    </div>
  );
}
