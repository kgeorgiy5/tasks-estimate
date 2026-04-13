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
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { parseErrorCode } from "@tasks-estimate/shared";
import { useEffect, useState } from "react";

type ManageProjectDialogProps = Readonly<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** If provided, the dialog will edit the project instead of creating one */
  projectId?: string;
  /** Initial title to prefill when editing */
  initialTitle?: string;
  /** Called after create or edit with resulting project id */
  onSaved?: (projectId: string) => void;
}>;

export function ManageProjectDialog({ open, onOpenChange, projectId, initialTitle, onSaved }: ManageProjectDialogProps) {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async (payload: { title: string }) => {
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
    if (open) setTitle(initialTitle ?? "");
  }, [open, initialTitle]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Project wizard</DialogTitle>
        </DialogHeader>

        <form
          className="space-y-3"
          onSubmit={async (e) => {
            e.preventDefault();
            setError(null);
            const t = title.trim();
            if (!t) return setError("Project title is required");
            await mutation.mutateAsync({ title: t });
          }}
        >
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Project title" autoFocus disabled={mutation.isPending} />
          {error ? <p className="text-xs text-destructive">{error}</p> : null}

          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)} disabled={mutation.isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
