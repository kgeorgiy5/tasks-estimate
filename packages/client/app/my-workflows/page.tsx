"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ListUserWorkflowDto,
  ManageWorkflowDto,
  parseErrorCode,
} from "@tasks-estimate/shared";
import {
  applyWorkflowToProject,
  deleteWorkflow,
  editWorkflow,
  listMyWorkflows,
  listProjects,
} from "@/api";
import { ConfirmDeleteDialog } from "@/components/index";
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
import { CategoriesChips } from "./components/categories-chips";
import { NavigationPaths } from "@/config";

/**
 * Ensures workflow title starts with uppercase letter.
 */
function formatTitle(title: string): string {
  if (!title || title.length === 0) {
    return title;
  }

  return `${title[0].toUpperCase()}${title.slice(1)}`;
}

/**
 * My workflows page.
 */
export default function MyWorkflowsPage() {
  const queryClient = useQueryClient();

  const [workflowForApply, setWorkflowForApply] =
    useState<ListUserWorkflowDto | null>(null);
  const [workflowForEdit, setWorkflowForEdit] =
    useState<ListUserWorkflowDto | null>(null);
  const [workflowForDelete, setWorkflowForDelete] =
    useState<ListUserWorkflowDto | null>(null);

  const [applyProjectId, setApplyProjectId] = useState("");
  const [applyError, setApplyError] = useState<string | null>(null);

  const [editProjectId, setEditProjectId] = useState("");
  const [editDomain, setEditDomain] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editCategories, setEditCategories] = useState("");
  const [editError, setEditError] = useState<string | null>(null);
  const editCategoriesArray = useMemo(
    () =>
      editCategories
        .split(",")
        .map((c) => c.trim())
        .filter((c) => c.length > 0),
    [editCategories],
  );

  const workflowsQuery = useQuery({
    queryKey: ["my-workflows"],
    queryFn: () => listMyWorkflows(),
  });

  const projectsQuery = useQuery({
    queryKey: ["projects"],
    queryFn: () => listProjects(),
  });

  const applyMutation = useMutation({
    mutationFn: async (payload: { workflowId: string; projectId: string }) => {
      return await applyWorkflowToProject(payload.workflowId, {
        projectId: payload.projectId,
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["my-workflows"] });
      setWorkflowForApply(null);
      setApplyProjectId("");
      setApplyError(null);
    },
    onError: (error: unknown) => {
      setApplyError(parseErrorCode(error));
    },
  });

  const editMutation = useMutation({
    mutationFn: async (payload: {
      workflowId: string;
      workflowPayload: ManageWorkflowDto;
    }) => {
      return await editWorkflow(payload.workflowId, payload.workflowPayload);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["my-workflows"] });
      setWorkflowForEdit(null);
      setEditError(null);
    },
    onError: (error: unknown) => {
      setEditError(parseErrorCode(error));
    },
  });

  const deleteMutation = useMutation<void, Error, string>({
    mutationFn: deleteWorkflow,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["my-workflows"] });
      setWorkflowForDelete(null);
    },
  });

  const applyProjects = useMemo(() => {
    if (!workflowForApply) {
      return [];
    }

    return (projectsQuery.data ?? []).filter(
      (project) => project._id !== workflowForApply.projectId,
    );
  }, [projectsQuery.data, workflowForApply]);

  useEffect(() => {
    if (!workflowForApply) {
      setApplyProjectId("");
      setApplyError(null);
      return;
    }

    const firstProject = applyProjects[0];
    setApplyProjectId(firstProject?._id ?? "");
  }, [applyProjects, workflowForApply]);

  useEffect(() => {
    if (!workflowForEdit) {
      setEditProjectId("");
      setEditDomain("");
      setEditTitle("");
      setEditDescription("");
      setEditCategories("");
      setEditError(null);
      return;
    }

    setEditProjectId(workflowForEdit.projectId ?? "");
    setEditDomain(workflowForEdit.domain);
    setEditTitle(workflowForEdit.title);
    setEditDescription(workflowForEdit.description);
    setEditCategories(workflowForEdit.categories.join(", "));
    setEditError(null);
  }, [workflowForEdit]);

  const handleApply = async () => {
    if (!workflowForApply || !applyProjectId) {
      setApplyError("Select a target project");
      return;
    }

    setApplyError(null);

    await applyMutation.mutateAsync({
      workflowId: workflowForApply._id,
      projectId: applyProjectId,
    });
  };

  const handleEdit = async () => {
    if (!workflowForEdit) {
      return;
    }

    const categories = editCategories
      .split(",")
      .map((category) => category.trim())
      .filter((category) => category.length > 0);

    if (!editProjectId || !editDomain || !editTitle || !editDescription) {
      setEditError("Fill all required fields");
      return;
    }

    if (categories.length === 0) {
      setEditError("At least one category is required");
      return;
    }

    const payload: ManageWorkflowDto = {
      projectId: editProjectId,
      domain: editDomain.trim(),
      title: editTitle.trim(),
      description: editDescription.trim(),
      categories,
    };

    await editMutation.mutateAsync({
      workflowId: workflowForEdit._id,
      workflowPayload: payload,
    });
  };

  const workflows = workflowsQuery.data ?? [];

  return (
    <div className="flex h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="h-screen w-full max-w-[80vw] bg-white dark:bg-black sm:items-start">
        <div className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h1 className="text-xl font-semibold">My workflows</h1>
          </div>

          <div className="space-y-2">
            {workflowsQuery.isLoading ? (
              <div className="text-sm text-zinc-600">Loading...</div>
            ) : null}

            {workflowsQuery.isError ? (
              <div className="text-sm text-red-700">
                Failed to load workflows.
              </div>
            ) : null}

            {!workflowsQuery.isLoading &&
            !workflowsQuery.isError &&
            workflows.length === 0 ? (
              <div className="flex items-center justify-center w-full py-16 text-sm text-zinc-600">
                No workflows yet. Visit the{" "}
                <Link
                  href={NavigationPaths.MARKETPLACE}
                  className="text-primary underline mx-1"
                >
                  Marketplace
                </Link>{" "}
                to add workflows.
              </div>
            ) : null}

            {workflows.map((workflow: ListUserWorkflowDto) => (
              <div
                key={workflow._id}
                className="w-full flex items-center justify-between rounded border px-3 py-2"
              >
                <div className="min-w-0 flex items-center flex-row gap-2">
                  {!workflow.projectId && (
                    <span
                      title="No project assigned"
                      className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-yellow-100 text-yellow-800 text-xs"
                      aria-hidden
                    >
                      !
                    </span>
                  )}
                  <div>
                    <div className="truncate text-sm font-medium flex items-center gap-2">
                      <span>{formatTitle(workflow.title)}</span>
                    </div>
                    <div className="truncate text-xs text-zinc-600">
                      {workflow.description}
                    </div>
                    {workflow.projectId ? (
                      <div className="truncate text-xs text-zinc-500">
                        {`Project: ${workflow.projectTitle ?? "Unknown project"}`}
                      </div>
                    ) : (
                      <div className="truncate text-xs text-red-500">
                        No project assigned
                      </div>
                    )}
                  </div>
                </div>

                <div className="ml-4 flex shrink-0 gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setWorkflowForApply(workflow)}
                    disabled={applyMutation.isPending}
                  >
                    Apply to another project
                  </Button>
                    {workflow.projectId ? (
                      <Button
                        variant="ghost"
                        onClick={() => setWorkflowForEdit(workflow)}
                        disabled={editMutation.isPending}
                      >
                        Edit
                      </Button>
                    ) : null}
                  <Button
                    variant="destructive"
                    onClick={() => setWorkflowForDelete(workflow)}
                    disabled={deleteMutation.isPending}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Dialog
        open={Boolean(workflowForApply)}
        onOpenChange={(open) => {
          if (!open) {
            setWorkflowForApply(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Apply workflow to another project</DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            <label
              htmlFor="apply-project"
              className="text-xs text-muted-foreground"
            >
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
            {applyError ? (
              <p className="text-xs text-destructive">{applyError}</p>
            ) : null}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              type="button"
              onClick={() => setWorkflowForApply(null)}
              disabled={applyMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleApply}
              disabled={applyMutation.isPending || !applyProjectId}
            >
              {applyMutation.isPending ? "Applying..." : "Apply"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(workflowForEdit)}
        onOpenChange={(open) => {
          if (!open) {
            setWorkflowForEdit(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit workflow</DialogTitle>
          </DialogHeader>

          <form
            className="space-y-3"
            onSubmit={async (event) => {
              event.preventDefault();
              await handleEdit();
            }}
          >
            <label
              htmlFor="edit-project"
              className="block text-xs text-muted-foreground"
            >
              Project
            </label>
            <select
              id="edit-project"
              value={editProjectId}
              onChange={(event) => setEditProjectId(event.target.value)}
              className="h-9 w-full rounded-md border border-input bg-input/20 px-2 text-sm outline-none"
              disabled={editMutation.isPending}
            >
              <option value="" disabled>
                Select project
              </option>
              {(projectsQuery.data ?? []).map((project) => (
                <option key={project._id} value={project._id}>
                  {project.title}
                </option>
              ))}
            </select>

            <Input
              value={editDomain}
              onChange={(event) => setEditDomain(event.target.value)}
              placeholder="Domain"
              disabled={editMutation.isPending}
            />

            <Input
              value={editTitle}
              onChange={(event) => setEditTitle(event.target.value)}
              placeholder="Workflow title"
              disabled={editMutation.isPending}
            />

            <Textarea
              value={editDescription}
              onChange={(event) => setEditDescription(event.target.value)}
              placeholder="Workflow description"
              disabled={editMutation.isPending}
            />

              <div>
                <label className="text-xs text-muted-foreground block mb-2">Categories</label>
                <CategoriesChips
                  categories={editCategoriesArray}
                  onChange={(arr) => setEditCategories(arr.join(", "))}
                  disabled={editMutation.isPending}
                />
              </div>

            {editError ? (
              <p className="text-xs text-destructive">{editError}</p>
            ) : null}

            <DialogFooter>
              <Button
                variant="outline"
                type="button"
                onClick={() => setWorkflowForEdit(null)}
                disabled={editMutation.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={editMutation.isPending}>
                {editMutation.isPending ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDeleteDialog
        open={Boolean(workflowForDelete)}
        onOpenChange={(open) => {
          if (!open) {
            setWorkflowForDelete(null);
          }
        }}
        title={workflowForDelete?.title ?? ""}
        type="workflow"
        onConfirm={async () => {
          if (!workflowForDelete) {
            return;
          }

          await deleteMutation.mutateAsync(workflowForDelete._id);
        }}
      />
    </div>
  );
}
