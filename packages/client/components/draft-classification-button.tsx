"use client";

import { AiMagicIcon, Loading03Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { FC } from "react";
import { useT } from "@/i18n";

export type DraftClassificationButtonProps = {
  disabled?: boolean;
  isLoading?: boolean;
  onClick: () => void | Promise<void>;
};

/**
 * Renders the draft task classification trigger button.
 */
export const DraftClassificationButton: FC<DraftClassificationButtonProps> = ({
  disabled = false,
  isLoading = false,
  onClick,
}) => {
  const { t } = useT();

  return (
    <button
      type="button"
      onClick={() => {
        onClick();
      }}
      disabled={disabled || isLoading}
      aria-label={
        isLoading
          ? t("CLASSIFY_BUTTON.ARIA_CLASSIFYING")
          : t("CLASSIFY_BUTTON.ARIA_CLASSIFY")
      }
      className="rounded-full border border-zinc-200 bg-white text-zinc-700 shadow-sm transition hover:border-zinc-300 hover:text-zinc-900 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200 dark:hover:border-zinc-700"
    >
      <span className="flex h-10 w-10 items-center justify-center">
        <HugeiconsIcon
          icon={isLoading ? Loading03Icon : AiMagicIcon}
          strokeWidth={2}
          className={isLoading ? "size-5 animate-spin" : "size-5"}
          aria-hidden
        />
      </span>
    </button>
  );
};