"use client";

import { listProjects } from "@/api";
import { Button } from "@/components/ui/button";
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
import { useQuery } from "@tanstack/react-query";
import { JSX, useMemo, useState } from "react";
import { ProjectIcon } from "./project-icon";
import { ManageProjectDialog } from "./manage-project-dialog";

type ProjectSelectorProps = Readonly<{
  value?: string;
  onChange: (projectId?: string) => void;
  disabled?: boolean;
}>;

type FormSubmitEvent =
  Parameters<NonNullable<JSX.IntrinsicElements["form"]["onSubmit"]>>[0];

const NO_PROJECT_VALUE = "__none__";

/**
 * Renders a projects dropdown with in-place project creation modal.
 */
export function ProjectSelector({ value, onChange }: ProjectSelectorProps) {
  const disabled = (arguments[0] as ProjectSelectorProps | undefined)?.disabled ?? false;
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

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

  

  let triggerContent: any = null;
  if (projectsQuery.isLoading) {
    triggerContent = "Loading projects...";
  } else if (selectedProject) {
    triggerContent = (
      <div className="flex items-center gap-3 w-full">
        <ProjectIcon icon={selectedProject.icon} color={selectedProject.color} className="h-6 w-6" />
        <span className="truncate">{selectedProject.title}</span>
      </div>
    );
  } else {
    triggerContent = "Select project";
  }

  return (
    <>
      <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-between"
              disabled={projectsQuery.isLoading || disabled}
            >
              {triggerContent}
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
                <DropdownMenuRadioItem key={project._id} value={project._id} className="flex items-center gap-3">
                  <ProjectIcon icon={project.icon} color={project.color} className="h-5 w-5" iconClassName="h-3.5 w-3.5" />
                  <span className="truncate">{project.title}</span>
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

      <ManageProjectDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSaved={(id) => {
          onChange(id);
        }}
      />
    </>
  );
}
