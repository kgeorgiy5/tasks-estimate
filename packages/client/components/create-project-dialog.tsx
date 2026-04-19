"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ListMarketplaceWorkflowDto,
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
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DetailsStep } from "./details-step";
import { MyWorkflowsStep } from "./my-workflows-step";
import { MarketplaceStep } from "./marketplace-step";
import { FooterButtons } from "./footer-buttons";
import { CreateProjectStep, SelectedWorkflow, getStepLabel } from "../types/create-project";

type CreateProjectDialogProps = Readonly<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved?: (projectId: string) => void;
  initialSelectedWorkflow?: SelectedWorkflow | null;
  initialStep?: CreateProjectStep;
}>;

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
        await applyWorkflowToProject(payload.selectedWorkflow.workflow._id, {
          projectId: createdProject._id,
        });
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

  const stepTitle = step === "details" ? "Create project" : "Select workflow";
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[50vw]! max-w-[50vw]! h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{stepTitle}</DialogTitle>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {stepLabel}
          </p>
        </DialogHeader>

        <div className="flex-1 overflow-auto px-4 py-2">
          {step === "details" && (
            <DetailsStep
              title={title}
              setTitle={setTitle}
              icon={icon}
              setIcon={setIcon}
              color={color}
              setColor={setColor}
              createMutationPending={createMutation.isPending}
              onNext={handleNextFromDetails}
            />
          )}

          {step === "my-workflows" && (
            <MyWorkflowsStep
              query={myWorkflowsQuery}
              workflows={myWorkflows}
              selectedWorkflow={selectedWorkflow}
              setSelectedWorkflow={setSelectedWorkflow}
              createMutationPending={createMutation.isPending}
              onOpenMarketplace={handleOpenMarketplace}
            />
          )}

          {step === "marketplace" && (
            <MarketplaceStep
              query={marketplaceWorkflowsQuery}
              workflows={marketplaceWorkflows}
              selectedWorkflow={selectedWorkflow}
              setSelectedWorkflow={setSelectedWorkflow}
              createMutationPending={createMutation.isPending}
            />
          )}

          {error ? <p className="text-xs text-destructive">{error}</p> : null}
        </div>

        <DialogFooter>
          <FooterButtons
            step={step}
            onClose={() => onOpenChange(false)}
            onBack={() =>
              setStep(step === "marketplace" ? "my-workflows" : "details")
            }
            onNext={handleNextFromDetails}
            onCreate={handleCreate}
            createMutationPending={createMutation.isPending}
            selectedWorkflow={selectedWorkflow}
            setStep={setStep}
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// helper components moved to separate files
