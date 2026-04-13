import { FC } from "react";

type PlayButtonIconProps = {
  loading?: boolean;
  isRunning: boolean;
};

export const PlayButtonIcon: FC<PlayButtonIconProps> = ({
  isRunning,
  loading,
}) => {
  if (loading) {
    return (
      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
          strokeOpacity="0.25"
        />
        <path
          d="M22 12a10 10 0 00-10-10"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  if (isRunning) {
    return (
      <svg
        className="h-5 w-5"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect x="6" y="6" width="12" height="12" fill="currentColor" />
      </svg>
    );
  }

  return (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M8 5v14l11-7z" fill="currentColor" />
    </svg>
  );
};
