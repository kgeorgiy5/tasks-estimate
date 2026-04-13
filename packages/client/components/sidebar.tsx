"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/stores";
import { NavigationPaths } from "@/config/navigation-paths.config";
import type { FC } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import * as HIcons from "@hugeicons/core-free-icons";

/**
 * Sidebar component shown on all app pages.
 */
export const Sidebar: FC = () => {
  const router = useRouter();
  const pathname = usePathname();

  const navItems: ReadonlyArray<{ title: string; path: string; iconName: string }> = [
    { title: "Dashboard", path: NavigationPaths.HOME, iconName: "HomeIcon" },
    { title: "Time Entries", path: NavigationPaths.TIME_ENTRIES, iconName: "ClockIcon" },
    { title: "Projects", path: NavigationPaths.PROJECTS, iconName: "FolderIcon" },
    { title: "My Workflows", path: NavigationPaths.MY_WORKFLOWS, iconName: "AllBookmarkIcon" },
    { title: "Marketplace", path: NavigationPaths.MARKETPLACE, iconName: "StoreIcon" },
  ];

  return (
    <aside className="w-60 shrink-0 bg-white/80 dark:bg-slate-900/80 border-r border-slate-200 dark:border-slate-800 h-screen sticky top-0">
      <div className="h-full flex flex-col">
        <div className="px-4 py-6">
          <h1 className="text-lg font-semibold">Tasks</h1>
        </div>

        <nav className="flex-1 px-2">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const icon = (HIcons as any)[item.iconName];
              const isActive =
                item.path === NavigationPaths.HOME ? pathname === NavigationPaths.HOME : pathname?.startsWith(item.path ?? "");
              const linkClass = `block rounded-md px-3 py-2 text-sm font-medium ${
                isActive ? "bg-slate-100 dark:bg-slate-800" : "hover:bg-slate-100 dark:hover:bg-slate-800"
              }`;

              return (
                <li key={item.title}>
                  <Link href={item.path} className={linkClass}>
                    <span className="inline-flex items-center gap-2">
                      {icon ? (
                        <HugeiconsIcon icon={icon} className="shrink-0 h-4 w-4" strokeWidth={2} />
                      ) : null}
                      <span>{item.title}</span>
                    </span>
                  </Link>
                </li>
              );
            })}
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
