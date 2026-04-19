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
  createWorkflow,
  deleteWorkflow,
  editWorkflow,
  listMyWorkflows,
  listProjects,
} from "@/api";
import { ConfirmDeleteDialog } from "@/components/index";
import { Button } from "@/components/ui/button";
import { EditWorkflowDialog } from "./components/edit-workflow-dialog";
import { ApplyWorkflowDialog } from "./components/apply-workflow-dialog";
import { CreateWorkflowDialog } from "./components/create-workflow-dialog";
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

  // Create workflow state
  const [createOpen, setCreateOpen] = useState(false);
  const [createProjectId, setCreateProjectId] = useState("");
  const [createDomain, setCreateDomain] = useState("");
  const [createTitle, setCreateTitle] = useState("");
  const [createDescription, setCreateDescription] = useState("");
  const [createCategories, setCreateCategories] = useState("");
  const [createError, setCreateError] = useState<string | null>(null);
  const createCategoriesArray = useMemo(
    () =>
      createCategories
        .split(",")
        .map((c) => c.trim())
        .filter((c) => c.length > 0),
    [createCategories],
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

  const createMutation = useMutation({
    mutationFn: async (payload: ManageWorkflowDto) => {
      return await createWorkflow(payload);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["my-workflows"] });
      setCreateOpen(false);
      setCreateError(null);
      setCreateProjectId("");
      setCreateDomain("");
      setCreateTitle("");
      setCreateDescription("");
      setCreateCategories("");
    },
    onError: (error: unknown) => {
      setCreateError(parseErrorCode(error));
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

  useEffect(() => {
    if (!createOpen) {
      setCreateProjectId("");
      setCreateDomain("");
      setCreateTitle("");
      setCreateDescription("");
      setCreateCategories("");
      setCreateError(null);
      return;
    }

    setCreateProjectId("");
    setCreateDomain("");
    setCreateTitle("");
    setCreateDescription("");
    setCreateCategories("");
    setCreateError(null);
  }, [createOpen]);

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

  const handleCreate = async () => {
    setCreateError(null);

    const categories = createCategories
      .split(",")
      .map((category) => category.trim())
      .filter((category) => category.length > 0);

    if (!createDomain || !createTitle || !createDescription) {
      setCreateError("Fill all required fields");
      return;
    }

    if (categories.length === 0) {
      setCreateError("At least one category is required");
      return;
    }

    const payload: ManageWorkflowDto = {
      ...(createProjectId ? { projectId: createProjectId } : {}),
      domain: createDomain.trim(),
      title: createTitle.trim(),
      description: createDescription.trim(),
      categories,
    } as ManageWorkflowDto;

    await createMutation.mutateAsync(payload);
  };

  const workflows = workflowsQuery.data ?? [];

  return (
    <div className="flex h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="h-screen w-full max-w-[80vw] bg-white dark:bg-black sm:items-start">
        <div className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h1 className="text-xl font-semibold">My workflows</h1>
            <div>
              <Button type="button" onClick={() => setCreateOpen(true)}>
                Create workflow
              </Button>
            </div>
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

      <ApplyWorkflowDialog
        open={Boolean(workflowForApply)}
        onOpenChange={(open) => {
          if (!open) {
            setWorkflowForApply(null);
          }
        }}
        applyProjectId={applyProjectId}
        setApplyProjectId={setApplyProjectId}
        applyProjects={applyProjects}
        applyError={applyError}
        applyMutation={applyMutation}
        handleApply={handleApply}
      />

      <EditWorkflowDialog
        open={Boolean(workflowForEdit)}
        onOpenChange={(open) => {
          if (!open) {
            setWorkflowForEdit(null);
          }
        }}
        workflowForEdit={workflowForEdit}
        editProjectId={editProjectId}
        setEditProjectId={setEditProjectId}
        projects={projectsQuery.data ?? []}
        editDomain={editDomain}
        setEditDomain={setEditDomain}
        editTitle={editTitle}
        setEditTitle={setEditTitle}
        editDescription={editDescription}
        setEditDescription={setEditDescription}
        editCategoriesArray={editCategoriesArray}
        setEditCategories={setEditCategories}
        editError={editError}
        editMutation={editMutation}
        handleEdit={handleEdit}
      />

      <CreateWorkflowDialog
        open={createOpen}
        onOpenChange={(open) => {
          if (!open) {
            setCreateOpen(false);
          }
        }}
        createProjectId={createProjectId}
        setCreateProjectId={setCreateProjectId}
        projects={projectsQuery.data ?? []}
        createDomain={createDomain}
        setCreateDomain={setCreateDomain}
        createTitle={createTitle}
        setCreateTitle={setCreateTitle}
        createDescription={createDescription}
        setCreateDescription={setCreateDescription}
        createCategoriesArray={createCategoriesArray}
        setCreateCategories={setCreateCategories}
        createError={createError}
        createMutation={createMutation}
        handleCreate={handleCreate}
      />

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
