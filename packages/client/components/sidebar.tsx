"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores";
import { NavigationPaths } from "@/config/navigation-paths.config";
import type { FC } from "react";

/**
 * Sidebar component shown on all app pages.
 */
export const Sidebar: FC = () => {
  const router = useRouter();

  return (
    <aside className="w-60 shrink-0 bg-white/80 dark:bg-slate-900/80 border-r border-slate-200 dark:border-slate-800 h-screen sticky top-0">
      <div className="h-full flex flex-col">
        <div className="px-4 py-6">
          <h1 className="text-lg font-semibold">Tasks</h1>
        </div>

        <nav className="flex-1 px-2">
          <ul className="space-y-1">
            <li>
              <Link
                href="/"
                className="block rounded-md px-3 py-2 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <span className="inline-flex items-center gap-2">
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
                    aria-hidden
                    className="shrink-0"
                  >
                    <path d="M3 9.5L12 3l9 6.5V21a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1V9.5z" />
                  </svg>
                  <span>Dashboard</span>
                </span>
              </Link>
            </li>
            <li>
              <Link
                href="/time-entries"
                className="block rounded-md px-3 py-2 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <span className="inline-flex items-center gap-2">
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
                    aria-hidden
                    className="shrink-0"
                  >
                    <circle cx="12" cy="12" r="9" />
                    <path d="M12 7v6l4 2" />
                  </svg>
                  <span>Time Entries</span>
                </span>
              </Link>
            </li>
            <li>
              <Link
                href={NavigationPaths.PROJECTS}
                className="block rounded-md px-3 py-2 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <span className="inline-flex items-center gap-2">
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
                    aria-hidden
                    className="shrink-0"
                  >
                    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h5l2 2h9a2 2 0 0 1 2 2z" />
                  </svg>
                  <span>Projects</span>
                </span>
              </Link>
            </li>
            <li>
              <Link
                href={NavigationPaths.MARKETPLACE}
                className="block rounded-md px-3 py-2 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <span className="inline-flex items-center gap-2">
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
                    aria-hidden
                    className="shrink-0"
                  >
                    <path d="M3 7h18" />
                    <path d="M6 12h12" />
                    <path d="M9 17h6" />
                    <rect x="2" y="3" width="20" height="18" rx="2" />
                  </svg>
                  <span>Marketplace</span>
                </span>
              </Link>
            </li>
          </ul>
        </nav>

        <div className="px-4 py-4">
          <button
            type="button"
            onClick={async () => {
              useAuthStore.getState().clearAuth();
              try {
                await signOut({ redirect: false });
              } catch {
                /* ignore */
              }
              router.push(NavigationPaths.SIGN_IN);
            }}
            className="w-full flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800"
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
              className="inline-block"
              aria-hidden
            >
              <path d="M10 17l5-5-5-5" />
              <path d="M15 12H3" />
              <path d="M21 19V5a2 2 0 0 0-2-2h-7" />
            </svg>
            Logout
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
