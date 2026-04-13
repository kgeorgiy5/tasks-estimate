"use client";

import { createProject, listProjects } from "@/api";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { parseErrorCode } from "@tasks-estimate/shared";
import { JSX, useMemo, useState } from "react";

type ProjectSelectorProps = Readonly<{
  value?: string;
  onChange: (projectId?: string) => void;
}>;

type FormSubmitEvent =
  Parameters<NonNullable<JSX.IntrinsicElements["form"]["onSubmit"]>>[0];

const NO_PROJECT_VALUE = "__none__";

/**
 * Renders a projects dropdown with in-place project creation modal.
 */
export function ProjectSelector({ value, onChange }: ProjectSelectorProps) {
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [projectTitle, setProjectTitle] = useState("");
  const [createError, setCreateError] = useState<string | null>(null);

  const projectsQuery = useQuery({
    queryKey: ["projects"],
    queryFn: () => listProjects(),
    staleTime: 60_000,
  });

  const projects = projectsQuery.data ?? [];

  const selectedProject = useMemo(
    () => projects.find((project) => project._id === value),
    [projects, value],
  );

  const createProjectMutation = useMutation({
    mutationFn: createProject,
    onSuccess: async (project) => {
      await queryClient.invalidateQueries({ queryKey: ["projects"] });
      onChange(project._id);
      setProjectTitle("");
      setCreateError(null);
      setIsCreateDialogOpen(false);
    },
    onError: (error: unknown) => {
      setCreateError(parseErrorCode(error));
    },
  });

  /**
   * Submits project title and creates a project.
   */
  async function handleCreateProject(
    event: FormSubmitEvent,
  ): Promise<void> {
    event.preventDefault();
    setCreateError(null);

    const title = projectTitle.trim();
    if (!title) {
      setCreateError("Project title is required");
      return;
    }

    await createProjectMutation.mutateAsync({ title });
  }

  const triggerLabel = selectedProject?.title
    ? `Project: ${selectedProject.title}`
    : "Select project";

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-between"
            disabled={projectsQuery.isLoading}
          >
            {projectsQuery.isLoading ? "Loading projects..." : triggerLabel}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-(--radix-dropdown-menu-trigger-width)">
          <DropdownMenuLabel>Projects</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuRadioGroup
            value={value ?? NO_PROJECT_VALUE}
            onValueChange={(nextValue) => {
              if (nextValue === NO_PROJECT_VALUE) {
                onChange(undefined);
                return;
              }

              onChange(nextValue);
            }}
          >
            <DropdownMenuRadioItem value={NO_PROJECT_VALUE}>
              No project
            </DropdownMenuRadioItem>
            {projects.length === 0 ? (
              <DropdownMenuItem disabled>No projects yet</DropdownMenuItem>
            ) : (
              projects.map((project) => (
                <DropdownMenuRadioItem key={project._id} value={project._id}>
                  {project.title}
                </DropdownMenuRadioItem>
              ))
            )}
          </DropdownMenuRadioGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => setIsCreateDialogOpen(true)}>
            Create a project
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create a project</DialogTitle>
            <DialogDescription>
              Add a project, then use it for new tasks.
            </DialogDescription>
          </DialogHeader>

          <form className="space-y-3" onSubmit={handleCreateProject}>
            <Input
              aria-label="Project title"
              placeholder="Project title"
              value={projectTitle}
              onChange={(event) => setProjectTitle(event.target.value)}
              disabled={createProjectMutation.isPending}
              autoFocus
            />
            {createError ? (
              <p className="text-xs text-destructive">{createError}</p>
            ) : null}
            <DialogFooter>
              <Button
                variant="outline"
                type="button"
                onClick={() => setIsCreateDialogOpen(false)}
                disabled={createProjectMutation.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createProjectMutation.isPending}>
                {createProjectMutation.isPending ? "Creating..." : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
