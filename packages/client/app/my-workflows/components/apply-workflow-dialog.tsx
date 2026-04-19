"use client"

import React from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

/**
 * Props for ApplyWorkflowDialog.
 */
export interface ApplyWorkflowDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  applyProjectId: string;
  setApplyProjectId: (v: string) => void;
  applyProjects: Array<{ _id: string; title: string }>;
  applyError: string | null;
  applyMutation: { isPending: boolean };
  handleApply: () => Promise<void>;
}

/**
 * Dialog to apply a workflow to another project.
 */
export function ApplyWorkflowDialog(props: Readonly<ApplyWorkflowDialogProps>) {
  const { open, onOpenChange, applyProjectId, setApplyProjectId, applyProjects, applyError, applyMutation, handleApply } = props;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Apply workflow to another project</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <label htmlFor="apply-project" className="text-xs text-muted-foreground">
            Target project
          </label>
          <select
            id="apply-project"
            value={applyProjectId}
            onChange={(event) => setApplyProjectId(event.target.value)}
            className="h-9 w-full rounded-md border border-input bg-input/20 px-2 text-sm outline-none"
            disabled={applyMutation.isPending}
          >
            <option value="" disabled>
              Select project
            </option>
            {applyProjects.map((project) => (
              <option key={project._id} value={project._id}>
                {project.title}
              </option>
            ))}
          </select>
          {applyError ? <p className="text-xs text-destructive">{applyError}</p> : null}
        </div>

        <DialogFooter>
          <Button variant="outline" type="button" onClick={() => onOpenChange(false)} disabled={applyMutation.isPending}>
            Cancel
          </Button>
          <Button type="button" onClick={handleApply} disabled={applyMutation.isPending || !applyProjectId}>
            {applyMutation.isPending ? "Applying..." : "Apply"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// no default export
