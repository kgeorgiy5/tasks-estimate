"use client"

import React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CategoriesChips } from "./categories-chips";
import { useT } from "@/i18n";

type CreateMutationLike = { isPending: boolean };

export interface CreateWorkflowDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  createProjectId: string;
  setCreateProjectId: (v: string) => void;
  projects: Array<{ _id: string; title: string }>;
  createDomain: string;
  setCreateDomain: (v: string) => void;
  createTitle: string;
  setCreateTitle: (v: string) => void;
  createDescription: string;
  setCreateDescription: (v: string) => void;
  createCategoriesArray: string[];
  setCreateCategories: (v: string) => void;
  createError: string | null;
  createMutation: CreateMutationLike;
  handleCreate: () => Promise<void>;
}

export function CreateWorkflowDialog(props: Readonly<CreateWorkflowDialogProps>) {
  const {
    open,
    onOpenChange,
    createProjectId,
    setCreateProjectId,
    projects,
    createDomain,
    setCreateDomain,
    createTitle,
    setCreateTitle,
    createDescription,
    setCreateDescription,
    createCategoriesArray,
    setCreateCategories,
    createError,
    createMutation,
    handleCreate,
  } = props;
  const { t } = useT();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[70vw]! h-[80vh]! max-w-none! flex flex-col overflow-auto">
        <DialogHeader>
          <DialogTitle>{t("CREATE_WORKFLOW_DIALOG.TITLE")}</DialogTitle>
        </DialogHeader>

        <form className="space-y-3">
          <label htmlFor="create-project" className="block text-xs text-muted-foreground">
            {t("CREATE_WORKFLOW_DIALOG.PROJECT_LABEL")}
          </label>
          <select
            id="create-project"
            value={createProjectId}
            onChange={(event) => setCreateProjectId(event.target.value)}
            className="h-9 w-full rounded-md border border-input bg-input/20 px-2 text-sm outline-none"
            disabled={createMutation.isPending}
          >
            <option value="">{t("CREATE_WORKFLOW_DIALOG.NO_PROJECT")}</option>
            {projects.map((project) => (
              <option key={project._id} value={project._id}>
                {project.title}
              </option>
            ))}
          </select>


          <Input value={createDomain} onChange={(e) => setCreateDomain(e.target.value)} placeholder={t("CREATE_WORKFLOW_DIALOG.DOMAIN_PLACEHOLDER")} disabled={createMutation.isPending} />

          <Input value={createTitle} onChange={(e) => setCreateTitle(e.target.value)} placeholder={t("CREATE_WORKFLOW_DIALOG.TITLE_PLACEHOLDER")} disabled={createMutation.isPending} />

          <Textarea value={createDescription} onChange={(e) => setCreateDescription(e.target.value)} placeholder={t("CREATE_WORKFLOW_DIALOG.DESCRIPTION_PLACEHOLDER")} disabled={createMutation.isPending} />

          <div>
            <div className="text-xs text-muted-foreground block mb-2">{t("CREATE_WORKFLOW_DIALOG.CATEGORIES_LABEL")}</div>
            <CategoriesChips categories={createCategoriesArray} onChange={(arr) => setCreateCategories(arr.join(", "))} disabled={createMutation.isPending} />
          </div>

          {createError ? <p className="text-xs text-destructive">{createError}</p> : null}
        </form>

          <DialogFooter className="mt-12 gap-4 sm:justify-center">
          <Button
            variant="outline"
            type="button"
            onClick={(e) => {
              e.preventDefault();
              onOpenChange(false);
            }}
            disabled={createMutation.isPending}
          >
            {t("CREATE_WORKFLOW_DIALOG.CANCEL")}
          </Button>
          <Button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              void handleCreate();
            }}
            disabled={createMutation.isPending}
          >
            {createMutation.isPending ? t("CREATE_WORKFLOW_DIALOG.CREATING") : t("CREATE_WORKFLOW_DIALOG.CREATE")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
