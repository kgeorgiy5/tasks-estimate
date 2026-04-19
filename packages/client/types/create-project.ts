import { ListMarketplaceWorkflowDto, ListUserWorkflowDto, ListUserWorkflowsDto } from "@tasks-estimate/shared";

export type CreateProjectStep = "details" | "my-workflows" | "marketplace";

export type SelectedWorkflow =
  | {
      source: "my";
      workflow: ListUserWorkflowDto;
    }
  | {
      source: "marketplace";
      workflow: ListMarketplaceWorkflowDto[number];
    };

/**
 * Returns current step progress label.
 */
export function getStepLabel(step: CreateProjectStep): string {
  if (step === "details") {
    return "Step 1 of 2";
  }

  if (step === "my-workflows") {
    return "Step 2 of 2";
  }

  return "Step 3 of 3";
}

export type { ListUserWorkflowsDto } from "@tasks-estimate/shared";
