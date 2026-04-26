"use client"

import React from "react";
import { ListUserWorkflowDto } from "@tasks-estimate/shared";
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

type EditMutationLike = { isPending: boolean };

/**
 * Props for EditWorkflowDialog component.
 */
export interface EditWorkflowDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workflowForEdit: ListUserWorkflowDto | null;
  editProjectId: string;
  setEditProjectId: (v: string) => void;
  projects: Array<{ _id: string; title: string }>;
  editDomain: string;
  setEditDomain: (v: string) => void;
  editTitle: string;
  setEditTitle: (v: string) => void;
  editDescription: string;
  setEditDescription: (v: string) => void;
  editCategoriesArray: string[];
  setEditCategories: (v: string) => void;
  editError: string | null;
  editMutation: EditMutationLike;
  handleEdit: () => Promise<void>;
}

/**
 * Dialog containing workflow edit form.
 */
export function EditWorkflowDialog(props: Readonly<EditWorkflowDialogProps>) {
  const {
    open,
    onOpenChange,
    editProjectId,
    setEditProjectId,
    projects,
    editDomain,
    setEditDomain,
    editTitle,
    setEditTitle,
    editDescription,
    setEditDescription,
    editCategoriesArray,
    setEditCategories,
    editError,
    editMutation,
    handleEdit,
  } = props;
  const { t } = useT();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[70vw]! h-[80vh]! max-w-none! flex flex-col overflow-auto">
        <DialogHeader>
          <DialogTitle>{t("EDIT_WORKFLOW_DIALOG.TITLE")}</DialogTitle>
        </DialogHeader>

        <form className="space-y-3">
          <label htmlFor="edit-project" className="block text-xs text-muted-foreground">
            {t("EDIT_WORKFLOW_DIALOG.PROJECT_LABEL")}
          </label>
          <select
            id="edit-project"
            value={editProjectId}
            onChange={(event) => setEditProjectId(event.target.value)}
            className="h-9 w-full rounded-md border border-input bg-input/20 px-2 text-sm outline-none"
            disabled={editMutation.isPending}
          >
            <option value="" disabled>
              {t("EDIT_WORKFLOW_DIALOG.SELECT_PROJECT")}
            </option>
            {projects.map((project) => (
              <option key={project._id} value={project._id}>
                {project.title}
              </option>
            ))}
          </select>

          <Input value={editDomain} onChange={(e) => setEditDomain(e.target.value)} placeholder={t("EDIT_WORKFLOW_DIALOG.DOMAIN_PLACEHOLDER")} disabled={editMutation.isPending} />

          <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} placeholder={t("EDIT_WORKFLOW_DIALOG.TITLE_PLACEHOLDER")} disabled={editMutation.isPending} />

          <Textarea value={editDescription} onChange={(e) => setEditDescription(e.target.value)} placeholder={t("EDIT_WORKFLOW_DIALOG.DESCRIPTION_PLACEHOLDER")} disabled={editMutation.isPending} />

          <div>
            <div className="text-xs text-muted-foreground block mb-2">{t("EDIT_WORKFLOW_DIALOG.CATEGORIES_LABEL")}</div>
            <CategoriesChips categories={editCategoriesArray} onChange={(arr) => setEditCategories(arr.join(", "))} disabled={editMutation.isPending} />
          </div>

          {editError ? <p className="text-xs text-destructive">{editError}</p> : null}
        </form>

        <DialogFooter className="mt-12 gap-4 sm:justify-center">
          <Button
            variant="outline"
            type="button"
            onClick={(e) => {
              e.preventDefault();
              onOpenChange(false);
            }}
            disabled={editMutation.isPending}
          >
            {t("EDIT_WORKFLOW_DIALOG.CANCEL")}
          </Button>
          <Button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              void handleEdit();
            }}
            disabled={editMutation.isPending}
          >
            {editMutation.isPending ? t("EDIT_WORKFLOW_DIALOG.SAVING") : t("EDIT_WORKFLOW_DIALOG.SAVE")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
