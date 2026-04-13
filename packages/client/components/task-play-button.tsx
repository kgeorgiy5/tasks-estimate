"use client";

type TaskPlayButtonProps = {
  onClick: () => Promise<void> | void;
  loading?: boolean;
  disabled?: boolean;
  ariaLabel?: string;
  variant?: "solid" | "ghost";
};

/**
 * Renders a small circular play button used in task cards.
 * @param props TaskPlayButtonProps
 */
export default function TaskPlayButton({
  onClick,
  loading = false,
  disabled = false,
  ariaLabel,
  variant = "ghost",
}: Readonly<TaskPlayButtonProps>) {
  const isDisabled = Boolean(disabled || loading);

  const base = "rounded-full w-8 h-8 flex items-center justify-center disabled:opacity-50";
  const cursor = isDisabled ? "cursor-not-allowed" : "cursor-pointer";
  const solid = isDisabled ? "bg-zinc-400 text-white" : "bg-green-600 text-white";
  const ghost = isDisabled ? "bg-transparent text-zinc-400" : "bg-transparent text-green-600";
  const classes = `${base} ${cursor} ${variant === "solid" ? solid : ghost}`;

  return (
    <button onClick={onClick} disabled={isDisabled} aria-label={ariaLabel} className={classes}>
      {loading ? (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeOpacity="0.25" />
          <path d="M22 12a10 10 0 00-10-10" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
        </svg>
      ) : (
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M6 4v16l14-8L6 4z" fill="currentColor" />
        </svg>
      )}
    </button>
  );
}
