"use client";

import { Button } from "@/components/ui/button";
import { deleteProject } from "@/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FC, useState } from "react";
import type { GetProjectDto } from "@tasks-estimate/shared";
import { ManageProjectDialog } from "./manage-project-dialog";
import { ConfirmDeleteDialog } from "./confirm-delete-dialog";
import { ProjectIcon } from "./project-icon";

type ProjectCardProps = {
  project: GetProjectDto;
};

export const ProjectCard: FC<ProjectCardProps> = ({ project }) => {
  const queryClient = useQueryClient();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const deleteMutation = useMutation({
    mutationFn: deleteProject,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });

  const handleDelete = async () => {
    setDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    await deleteMutation.mutateAsync(project._id);
    setDeleteOpen(false);
  };

  const handleSaved = (id: string) => {
    queryClient.invalidateQueries({ queryKey: ["projects"] });
    setEditOpen(false);
  };

  return (
    <div className="w-full flex items-center justify-between rounded border px-3 py-2">
      <div className="flex-1 text-sm flex items-center gap-3">
        <ProjectIcon icon={project.icon} color={project.color} />
        <div className="truncate">{project.title}</div>
      </div>
      <div className="flex gap-2">
        <Button
          variant="ghost"
          onClick={() => setEditOpen(true)}
          className="cursor-pointer"
          aria-label={`Edit ${project.title}`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="shrink-0"
            aria-hidden
          >
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
          </svg>
        </Button>
        <Button
          variant="destructive"
          onClick={handleDelete}
          className="cursor-pointer"
          aria-label={`Delete ${project.title}`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="shrink-0"
            aria-hidden
          >
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
            <path d="M10 11v6" />
            <path d="M14 11v6" />
            <path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
          </svg>
        </Button>
      </div>
      <ManageProjectDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        projectId={project._id}
        initialTitle={project.title}
        initialIcon={project.icon}
        initialColor={project.color}
        onSaved={handleSaved}
      />
      <ConfirmDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title={project.title}
        type="project"
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
};
