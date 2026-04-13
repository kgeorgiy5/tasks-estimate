"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ListMarketplaceWorkflowDto,
  ListUserWorkflowDto,
  ListUserWorkflowsDto,
  ManageProjectDto,
  ManageWorkflowDto,
  parseErrorCode,
  ProjectIcon as ProjectIconType,
} from "@tasks-estimate/shared";

import { createProject } from "@/api/projects/projects-handlers";
import {
  applyWorkflowToProject,
  createWorkflow,
  listMarketplaceWorkflows,
  listMyWorkflows,
} from "@/api/workflows/workflows-handlers";
import { getDomainVisual, WorkflowCard } from "@/app/marketplace/components";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

import { ProjectColorPicker } from "./project-color-picker";
import { ProjectIconPicker } from "./project-icon-picker";

type CreateProjectDialogProps = Readonly<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved?: (projectId: string) => void;
}>;

type CreateProjectStep = "details" | "my-workflows" | "marketplace";

type SelectedWorkflow =
  | {
      source: "my";
      workflow: ListUserWorkflowDto;
    }
  | {
      source: "marketplace";
      workflow: ListMarketplaceWorkflowDto[number];
    };

/**
 * Checks whether selected workflow points to a specific card.
 */
function isSelectedWorkflow(
  selectedWorkflow: SelectedWorkflow | null,
  source: SelectedWorkflow["source"],
  workflowId: string,
): boolean {
  if (!selectedWorkflow) {
    return false;
  }

  return (
    selectedWorkflow.source === source &&
    selectedWorkflow.workflow._id === workflowId
  );
}

/**
 * Returns current step progress label.
 */
function getStepLabel(step: CreateProjectStep): string {
  if (step === "details") {
    return "Step 1 of 2";
  }

  if (step === "my-workflows") {
    return "Step 2 of 2";
  }

  return "Step 3 of 3";
}

/**
 * Creates a project dialog with workflow selection.
 */
export function CreateProjectDialog({
  open,
  onOpenChange,
  onSaved,
}: CreateProjectDialogProps) {
  const queryClient = useQueryClient();

  const [step, setStep] = useState<CreateProjectStep>("details");

  const [title, setTitle] = useState("");
  const [icon, setIcon] = useState<ProjectIconType | undefined>(undefined);
  const [color, setColor] = useState<string | undefined>(undefined);

  const [selectedWorkflow, setSelectedWorkflow] =
    useState<SelectedWorkflow | null>(null);
  const [error, setError] = useState<string | null>(null);

  const myWorkflowsQuery = useQuery<ListUserWorkflowsDto>({
    queryKey: ["my-workflows"],
    queryFn: () => listMyWorkflows(),
    enabled: open,
  });

  const marketplaceWorkflowsQuery = useQuery<ListMarketplaceWorkflowDto>({
    queryKey: ["marketplace-workflows", "all"],
    queryFn: () => listMarketplaceWorkflows(),
    enabled: open && step === "marketplace",
  });

  const myWorkflows = myWorkflowsQuery.data ?? [];
  const marketplaceWorkflows = marketplaceWorkflowsQuery.data ?? [];

  const hasMyWorkflows = myWorkflows.length > 0;

  const createMutation = useMutation({
    mutationFn: async (payload: {
      title: string;
      icon?: ProjectIconType;
      color?: string;
      selectedWorkflow: SelectedWorkflow;
    }) => {
      const createProjectPayload: ManageProjectDto = {
        title: payload.title,
        icon: payload.icon,
        color: payload.color,
      };

      const createdProject = await createProject(createProjectPayload);

      if (payload.selectedWorkflow.source === "my") {
        await applyWorkflowToProject(
          payload.selectedWorkflow.workflow._id,
          {
            projectId: createdProject._id,
          },
        );
      } else {
        const selectedMarketplaceWorkflow = payload.selectedWorkflow.workflow;

        const createWorkflowPayload: ManageWorkflowDto = {
          projectId: createdProject._id,
          domain: selectedMarketplaceWorkflow.domain,
          title: selectedMarketplaceWorkflow.title,
          description: selectedMarketplaceWorkflow.description,
          categories: selectedMarketplaceWorkflow.categories,
        };

        await createWorkflow(createWorkflowPayload);
      }

      return createdProject._id;
    },
    onSuccess: async (projectId) => {
      await queryClient.invalidateQueries({ queryKey: ["projects"] });
      setError(null);
      setStep("details");
      setTitle("");
      setIcon(undefined);
      setColor(undefined);
      setSelectedWorkflow(null);
      onOpenChange(false);
      onSaved?.(projectId);
    },
    onError: (mutationError: unknown) => {
      setError(parseErrorCode(mutationError));
    },
  });

  useEffect(() => {
    if (!open) {
      setStep("details");
      setTitle("");
      setIcon(undefined);
      setColor(undefined);
      setSelectedWorkflow(null);
      setError(null);
      return;
    }

    setStep("details");
    setSelectedWorkflow(null);
    setError(null);
  }, [open]);

  /**
   * Moves from project details step to workflow selection.
   */
  const handleNextFromDetails = () => {
    setError(null);

    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setError("Project title is required");
      return;
    }

    setTitle(trimmedTitle);
    setStep("my-workflows");
  };

  /**
   * Creates project and assigns selected workflow.
   */
  const handleCreate = async () => {
    setError(null);

    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setError("Project title is required");
      setStep("details");
      return;
    }

    if (!selectedWorkflow) {
      setError("Select a workflow first");
      return;
    }

    await createMutation.mutateAsync({
      title: trimmedTitle,
      icon,
      color,
      selectedWorkflow,
    });
  };

  /**
   * Opens marketplace workflow import step.
   */
  const handleOpenMarketplace = () => {
    setError(null);
    setStep("marketplace");
  };

  const stepLabel = getStepLabel(step);

  const stepTitle =
    step === "details" ? "Create project" : "Select workflow";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[50vw]! max-w-[50vw]! h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{stepTitle}</DialogTitle>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">{stepLabel}</p>
        </DialogHeader>

        <div className="flex-1 overflow-auto px-4 py-2">
          {step === "details" ? (
            <form
              className="space-y-3"
              onSubmit={async (event) => {
                event.preventDefault();
                handleNextFromDetails();
              }}
            >
              <Input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Project title"
                autoFocus
                disabled={createMutation.isPending}
              />
              <div className="flex items-center gap-2">
                <ProjectIconPicker
                  value={icon}
                  onChange={setIcon}
                  disabled={createMutation.isPending}
                />
                <ProjectColorPicker
                  value={color}
                  onChange={setColor}
                  disabled={createMutation.isPending}
                />
              </div>
            </form>
          ) : null}

          {step === "my-workflows" ? (
            <div className="space-y-3">
              <p className="text-sm text-zinc-600 dark:text-zinc-300">
                Select one of your workflows or import from marketplace.
              </p>

              {myWorkflowsQuery.isLoading ? (
                <p className="text-sm text-zinc-600 dark:text-zinc-300">
                  Loading your workflows...
                </p>
              ) : null}

              {myWorkflowsQuery.isError ? (
                <p className="text-sm text-destructive">
                  Failed to load your workflows.
                </p>
              ) : null}

              {hasMyWorkflows ? (
                <div className="overflow-x-auto max-w-full hide-scrollbar">
                  <div className="flex w-max gap-4 pb-2">
                    {myWorkflows.map((workflow) => {
                      const isSelected = isSelectedWorkflow(
                        selectedWorkflow,
                        "my",
                        workflow._id,
                      );

                      return (
                        <WorkflowCard
                          key={workflow._id}
                          workflow={workflow}
                          visual={getDomainVisual(workflow.domain)}
                          actionLabel={
                            isSelected ? "Selected" : "Use this workflow"
                          }
                          onAction={() => {
                            setSelectedWorkflow({ source: "my", workflow });
                          }}
                          disabled={createMutation.isPending}
                          selected={isSelected}
                          className="w-80 min-w-80"
                        />
                      );
                    })}
                  </div>
                </div>
              ) : null}

              {!hasMyWorkflows && myWorkflowsQuery.isSuccess ? (
                <p className="text-sm text-zinc-600 dark:text-zinc-300">
                  You do not have your own workflows yet.
                </p>
              ) : null}

              <button
                type="button"
                onClick={handleOpenMarketplace}
                disabled={createMutation.isPending}
                className="cursor-pointer text-primary underline underline-offset-2 hover:text-primary/80 disabled:opacity-50"
              >
                Import marketplace workflow
              </button>
            </div>
          ) : null}

          {step === "marketplace" ? (
            <div className="space-y-3">
              <p className="text-sm text-zinc-600 dark:text-zinc-300">
                Select one marketplace workflow for the new project.
              </p>

              {marketplaceWorkflowsQuery.isLoading ? (
                <p className="text-sm text-zinc-600 dark:text-zinc-300">
                  Loading marketplace workflows...
                </p>
              ) : null}

              {marketplaceWorkflowsQuery.isError ? (
                <p className="text-sm text-destructive">
                  Failed to load marketplace workflows.
                </p>
              ) : null}

              {marketplaceWorkflows.length > 0 ? (
                <div className="overflow-x-auto hide-scrollbar max-w-full">
                  <div className="flex w-max gap-4 pb-2">
                    {marketplaceWorkflows.map((workflow) => {
                      const isSelected = isSelectedWorkflow(
                        selectedWorkflow,
                        "marketplace",
                        workflow._id,
                      );

                      return (
                        <WorkflowCard
                          key={workflow._id}
                          workflow={workflow}
                          visual={getDomainVisual(workflow.domain)}
                          actionLabel={
                            isSelected ? "Selected" : "Use this workflow"
                          }
                          onAction={() => {
                            setSelectedWorkflow({
                              source: "marketplace",
                              workflow,
                            });
                          }}
                          disabled={createMutation.isPending}
                          selected={isSelected}
                          className="w-80 min-w-80"
                        />
                      );
                    })}
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}

          {error ? <p className="text-xs text-destructive">{error}</p> : null}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            type="button"
            onClick={() => onOpenChange(false)}
            disabled={createMutation.isPending}
          >
            Cancel
          </Button>

          {step === "details" ? (
            <Button
              type="button"
              onClick={handleNextFromDetails}
              disabled={createMutation.isPending}
            >
              Next
            </Button>
          ) : null}

          {step === "my-workflows" ? (
            <>
              <Button
                variant="outline"
                type="button"
                onClick={() => setStep("details")}
                disabled={createMutation.isPending}
              >
                Back
              </Button>
              <Button
                type="button"
                onClick={handleCreate}
                disabled={
                  createMutation.isPending ||
                  selectedWorkflow?.source !== "my"
                }
              >
                {createMutation.isPending ? "Creating..." : "Create project"}
              </Button>
            </>
          ) : null}

          {step === "marketplace" ? (
            <>
              <Button
                variant="outline"
                type="button"
                onClick={() => setStep("my-workflows")}
                disabled={createMutation.isPending}
              >
                Back
              </Button>
              <Button
                type="button"
                onClick={handleCreate}
                disabled={
                  createMutation.isPending ||
                  selectedWorkflow?.source !== "marketplace"
                }
              >
                {createMutation.isPending ? "Creating..." : "Create project"}
              </Button>
            </>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
