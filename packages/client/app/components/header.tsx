"use client";

import type { FC } from "react";
import { useT } from "@/i18n";
import {
  PlayButton,
  ProjectSelector,
  Timer,
  CategoriesDropdown,
} from "@components/index";
import { CompactCategoriesChips } from "./compact-categories-chips";

/**
 * Props for Header component
 */
export interface HeaderProps {
  title: string;
  setTitle: (v: string) => void;
  selectedProjectId?: string;
  setSelectedProjectId: (id?: string) => void;
  selectedCategories: string[];
  setSelectedCategories: (c: string[]) => void;
  currentEntry: unknown;
  currentEntryQuery: { isLoading?: boolean };
  onStarted?: () => void;
}

/**
 * Header: task input row with project, categories, timer and play button
 */
export const Header: FC<HeaderProps> = ({
  title,
  setTitle,
  selectedProjectId,
  setSelectedProjectId,
  selectedCategories,
  setSelectedCategories,
  currentEntry,
  currentEntryQuery,
  onStarted,
}) => {
  const { t } = useT();

  return (
    <div className="w-full h-full flex items-center gap-4">
      <div className="w-full flex flex-col gap-2">
        <input
          aria-label={t("HEADER.TASK_TITLE_ARIA")}
          className="w-full rounded-md border px-3 py-2"
          placeholder={t("HEADER.NEW_TASK_TITLE_PLACEHOLDER")}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={!!currentEntry}
        />
        <div className="w-full inline-flex gap-2 flex-wrap items-center align-middle">
          <ProjectSelector
            value={selectedProjectId}
            className="w-fit inline"
            onChange={setSelectedProjectId}
            disabled={!!currentEntry}
          />
          <CategoriesDropdown
            className="w-fit inline"
            projectId={selectedProjectId}
            selected={selectedCategories}
            onChange={setSelectedCategories}
            disabled={!!currentEntry}
          />

          <CompactCategoriesChips
            categories={selectedCategories}
            onChange={setSelectedCategories}
            disabled={!!currentEntry}
          />
        </div>
      </div>
      <div className="shrink-0">
        <Timer />
      </div>
      <div className="flex shrink-0 items-center">
        {currentEntryQuery.isLoading ? (
          <span className="text-sm text-zinc-600">{t("HEADER.LOADING")}</span>
        ) : null}
        <PlayButton
          title={title}
          projectId={selectedProjectId}
          categories={selectedCategories}
          onStarted={onStarted}
        />
      </div>
    </div>
  );
};
