"use client";

import { Button } from "./ui/button";
import type { CreateProjectStep, SelectedWorkflow } from "../types/create-project";

export function FooterButtons({
  step,
  onClose,
  onBack,
  onNext,
  onCreate,
  createMutationPending,
  selectedWorkflow,
  setStep,
}: {
  step: CreateProjectStep;
  onClose: () => void;
  onBack: () => void;
  onNext: () => void;
  onCreate: () => void;
  createMutationPending: boolean;
  selectedWorkflow: SelectedWorkflow | null;
  setStep: (s: CreateProjectStep) => void;
}) {
  return (
    <>
      <Button variant="outline" type="button" onClick={onClose} disabled={createMutationPending}>
        Cancel
      </Button>

      {step === "details" && (
        <Button type="button" onClick={onNext} disabled={createMutationPending}>
          Next
        </Button>
      )}

      {step === "my-workflows" && (
        <>
          <Button variant="outline" type="button" onClick={onBack} disabled={createMutationPending}>
            Back
          </Button>
          <Button type="button" onClick={onCreate} disabled={createMutationPending || selectedWorkflow?.source !== "my"}>
            {createMutationPending ? "Creating..." : "Create project"}
          </Button>
        </>
      )}

      {step === "marketplace" && (
        <>
          <Button variant="outline" type="button" onClick={() => setStep("my-workflows")} disabled={createMutationPending}>
            Back
          </Button>
          <Button type="button" onClick={onCreate} disabled={createMutationPending || selectedWorkflow?.source !== "marketplace"}>
            {createMutationPending ? "Creating..." : "Create project"}
          </Button>
        </>
      )}
    </>
  );
}
