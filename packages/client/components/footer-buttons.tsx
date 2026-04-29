"use client";

import { Button } from "./ui/button";
import type { CreateProjectStep, SelectedWorkflow } from "../types/create-project";
import { useT } from "@/i18n";

/**
 * FooterButtons — dialog footer actions for project creation flow.
 */
export function FooterButtons({
  step,
  onClose,
  onBack,
  onNext,
  onCreate,
  createMutationPending,
  selectedWorkflow,
  setStep,
  detailsAction = "next",
}: Readonly<{
  step: CreateProjectStep;
  onClose: () => void;
  onBack: () => void;
  onNext: () => void | Promise<void>;
  onCreate: () => void;
  createMutationPending: boolean;
  selectedWorkflow: SelectedWorkflow | null;
  setStep: (s: CreateProjectStep) => void;
  detailsAction?: "next" | "create";
}>) {
  const { t } = useT();
  let detailsLabel = t("CREATE_PROJECT_DIALOG.NEXT");

  if (detailsAction === "create") {
    detailsLabel = createMutationPending
      ? t("CREATE_PROJECT_DIALOG.CREATING")
      : t("CREATE_PROJECT_DIALOG.CREATE_PROJECT");
  }

  return (
    <>
      <Button variant="outline" type="button" onClick={onClose} disabled={createMutationPending}>
        {t("CREATE_PROJECT_DIALOG.CANCEL")}
      </Button>

      {step === "details" && (
        <Button
          type="button"
          onClick={detailsAction === "create" ? onCreate : onNext}
          disabled={createMutationPending}
        >
          {detailsLabel}
        </Button>
      )}

      {step === "my-workflows" && (
        <>
          <Button variant="outline" type="button" onClick={onBack} disabled={createMutationPending}>
            {t("CREATE_PROJECT_DIALOG.BACK")}
          </Button>
          <Button type="button" onClick={onCreate} disabled={createMutationPending || selectedWorkflow?.source !== "my"}>
            {createMutationPending ? t("CREATE_PROJECT_DIALOG.CREATING") : t("CREATE_PROJECT_DIALOG.CREATE_PROJECT")}
          </Button>
        </>
      )}

      {step === "marketplace" && (
        <>
          <Button variant="outline" type="button" onClick={() => setStep("my-workflows")} disabled={createMutationPending}>
            {t("CREATE_PROJECT_DIALOG.BACK")}
          </Button>
          <Button type="button" onClick={onCreate} disabled={createMutationPending || selectedWorkflow?.source !== "marketplace"}>
            {createMutationPending ? t("CREATE_PROJECT_DIALOG.CREATING") : t("CREATE_PROJECT_DIALOG.CREATE_PROJECT")}
          </Button>
        </>
      )}
    </>
  );
}
