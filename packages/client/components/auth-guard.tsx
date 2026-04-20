"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "react-toastify";
import { NavigationPaths } from "@/config/navigation-paths.config";
import { Loader } from "./loader";
import { ErrorIds } from "@tasks-estimate/shared";
import { useAuthStore } from "@/stores";
import type { ReactNode } from "react";

type AuthGuardProps = {
  children: ReactNode;
};

const AUTH_ROUTES = new Set([NavigationPaths.SIGN_IN, NavigationPaths.SIGN_UP]);

/**
 * Protects private routes and redirects users based on auth status.
 */
export function AuthGuard({ children }: Readonly<AuthGuardProps>) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isInitialized = useAuthStore((state) => state.isInitialized);
  const router = useRouter();
  const pathname = usePathname();
  const isAuthRoute = AUTH_ROUTES.has(pathname as NavigationPaths);

  useEffect(() => {
    if (!isInitialized) {
      return;
    }

    if (!isAuthenticated && !isAuthRoute) {
      toast.error(ErrorIds.NOT_AUTHENTICATED);
      router.replace(NavigationPaths.SIGN_IN);
      return;
    }

    if (isAuthenticated && isAuthRoute) {
      router.replace(NavigationPaths.HOME);
    }
  }, [isAuthRoute, isAuthenticated, isInitialized, router]);

  if (!isInitialized) {
    return <Loader />;
  }

  if (!isAuthenticated && !isAuthRoute) {
    return null;
  }

  if (isAuthenticated && isAuthRoute) {
    return null;
  }

  return <>{children}</>;
}
