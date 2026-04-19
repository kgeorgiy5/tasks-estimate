"use client";

import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { ProjectIconPicker } from "./project-icon-picker";
import { ProjectColorPicker } from "./project-color-picker";
import { ProjectIcon as ProjectIconType } from "@tasks-estimate/shared";

/**
 * Details step UI.
 */
export function DetailsStep({
  title,
  setTitle,
  icon,
  setIcon,
  color,
  setColor,
  createMutationPending,
  onNext,
}: {
  title: string;
  setTitle: (v: string) => void;
  icon?: ProjectIconType | undefined;
  setIcon: (v: ProjectIconType | undefined) => void;
  color?: string | undefined;
  setColor: (v: string | undefined) => void;
  createMutationPending: boolean;
  onNext: () => void;
}) {
  return (
    <form
      className="space-y-3 flex flex-col gap-6"
      onSubmit={async (event) => {
        event.preventDefault();
        onNext();
      }}
    >
      <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <p className="font-semibold">Project and workflow</p>
        <ul className="mt-2 list-disc pl-5 text-sm text-zinc-600 dark:text-zinc-300">
          <li>Project: used to organize your tasks.</li>
          <li>
            Workflow: a pack of related categories (stages, tags) you can apply
            to a project.
          </li>
          <li>Each project can have only one workflow assigned at a time.</li>
          <li>Workflows can be modified individually after assignment.</li>
        </ul>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="project-title" className="mb-1">
            Enter project title <span className="text-destructive">*</span>
          </Label>
          <Input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Project title"
            autoFocus
            disabled={createMutationPending}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label className="mb-1">Choose project icon</Label>
          <ProjectIconPicker value={icon} onChange={setIcon} disabled={createMutationPending} />
        </div>
        <div className="flex flex-col gap-2">
          <Label className="mb-1">Choose project color</Label>
          <ProjectColorPicker value={color} onChange={setColor} disabled={createMutationPending} />
        </div>
      </div>
    </form>
  );
}
