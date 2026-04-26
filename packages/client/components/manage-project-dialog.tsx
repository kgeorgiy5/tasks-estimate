"use client";

import { createProject, editProject } from "@/api";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ProjectIconPicker } from "./project-icon-picker";
import { ProjectColorPicker } from "./project-color-picker";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { parseErrorCode, type ProjectIcon } from "@tasks-estimate/shared";
import { useEffect, useState } from "react";
import { useT } from "@/i18n";

type ManageProjectDialogProps = Readonly<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** If provided, the dialog will edit the project instead of creating one */
  projectId?: string;
  /** Initial title to prefill when editing */
  initialTitle?: string;
  /** Initial icon to prefill when editing */
  initialIcon?: ProjectIcon;
  /** Initial color to prefill when editing */
  initialColor?: string;
  /** Called after create or edit with resulting project id */
  onSaved?: (projectId: string) => void;
}>;

/**
 * ManageProjectDialog — create or edit a project.
 */
export function ManageProjectDialog({ open, onOpenChange, projectId, initialTitle, initialIcon, initialColor, onSaved }: ManageProjectDialogProps) {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [icon, setIcon] = useState<ProjectIcon | undefined>(undefined);
  const [color, setColor] = useState<string | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const { t } = useT();

  const mutation = useMutation({
    mutationFn: async (payload: { title: string; icon?: ProjectIcon; color?: string }) => {
      if (projectId) return await editProject(projectId, payload);
      return await createProject(payload);
    },
    onSuccess: async (project) => {
      await queryClient.invalidateQueries({ queryKey: ["projects"] });
      setTitle("");
      setError(null);
      onOpenChange(false);
      onSaved?.(project._id);
    },
    onError: (err: unknown) => setError(parseErrorCode(err)),
  });

  useEffect(() => {
    if (open) {
      setTitle(initialTitle ?? "");
      setIcon(initialIcon ?? undefined);
      setColor(initialColor ?? undefined);
    }
  }, [open, initialTitle, initialIcon, initialColor]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("MANAGE_PROJECT_DIALOG.TITLE")}</DialogTitle>
        </DialogHeader>

        <form
          className="space-y-3"
          onSubmit={async (e) => {
            e.preventDefault();
            setError(null);
            const t = title.trim();
            if (!t) return setError(t);
            await mutation.mutateAsync({ title: t, icon: icon ?? undefined, color: color ?? undefined });
          }}
        >
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t("MANAGE_PROJECT_DIALOG.PLACEHOLDER_TITLE")} autoFocus disabled={mutation.isPending} />
          <div className="flex gap-2 items-center">
            <ProjectIconPicker value={icon} onChange={setIcon} disabled={mutation.isPending} />
            <ProjectColorPicker value={color} onChange={setColor} disabled={mutation.isPending} />
          </div>
          {error ? <p className="text-xs text-destructive">{error}</p> : null}

          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)} disabled={mutation.isPending}>
              {t("MANAGE_PROJECT_DIALOG.CANCEL")}
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? t("MANAGE_PROJECT_DIALOG.SAVING") : t("MANAGE_PROJECT_DIALOG.SAVE")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
