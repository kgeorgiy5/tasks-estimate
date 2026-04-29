"use client";

import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { ProjectIconPicker } from "./project-icon-picker";
import { ProjectColorPicker } from "./project-color-picker";
import { ProjectIcon as ProjectIconType } from "@tasks-estimate/shared";
import { useT } from "@/i18n";

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
}: Readonly<{
  title: string;
  setTitle: (v: string) => void;
  icon?: ProjectIconType;
  setIcon: (v: ProjectIconType | undefined) => void;
  color?: string;
  setColor: (v: string | undefined) => void;
  createMutationPending: boolean;
  onNext: () => void | Promise<void>;
}>) {
  const { t } = useT();
  return (
    <form
      className="space-y-3 flex flex-col gap-6"
      onSubmit={async (event) => {
        event.preventDefault();
        onNext();
      }}
    >
      <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <p className="font-semibold">{t("DETAILS_STEP.HEADING")}</p>
        <ul className="mt-2 list-disc pl-5 text-sm text-zinc-600 dark:text-zinc-300">
          <li>{t("DETAILS_STEP.LIST.PROJECT")}</li>
          <li>{t("DETAILS_STEP.LIST.WORKFLOW")}</li>
          <li>{t("DETAILS_STEP.LIST.ONE_WORKFLOW")}</li>
          <li>{t("DETAILS_STEP.LIST.MODIFIABLE")}</li>
        </ul>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="project-title" className="mb-1">
            {t("DETAILS_STEP.LABEL_TITLE")} <span className="text-destructive">*</span>
          </Label>
          <Input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder={t("DETAILS_STEP.PLACEHOLDER_TITLE")}
            autoFocus
            disabled={createMutationPending}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label className="mb-1">{t("DETAILS_STEP.LABEL_ICON")}</Label>
          <ProjectIconPicker value={icon} onChange={setIcon} disabled={createMutationPending} />
        </div>
        <div className="flex flex-col gap-2">
          <Label className="mb-1">{t("DETAILS_STEP.LABEL_COLOR")}</Label>
          <ProjectColorPicker value={color} onChange={setColor} disabled={createMutationPending} />
        </div>
      </div>
    </form>
  );
}
