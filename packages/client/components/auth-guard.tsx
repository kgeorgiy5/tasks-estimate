"use client";

import { useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "react-toastify";
import { NavigationPaths } from "@/config/navigation-paths.config";
import { Loader } from "./loader";
import { ErrorIds } from "@tasks-estimate/shared";
import type { ReactNode } from "react";

type AuthGuardProps = {
  children: ReactNode;
};

const AUTH_ROUTES = new Set([NavigationPaths.SIGN_IN, NavigationPaths.SIGN_UP]);

/**
 * Protects private routes and redirects users based on auth status.
 */
export function AuthGuard({ children }: Readonly<AuthGuardProps>) {
  const { data: _session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const isAuthRoute = AUTH_ROUTES.has(pathname as NavigationPaths);

  useEffect(() => {
    if (status === "unauthenticated" && !isAuthRoute) {
      toast.error(ErrorIds.NOT_AUTHENTICATED);
      router.replace(NavigationPaths.SIGN_IN);
      return;
    }

    if (status === "authenticated" && isAuthRoute) {
      router.replace(NavigationPaths.HOME);
    }
  }, [isAuthRoute, router, status]);

  if (status === "loading" && !isAuthRoute) {
    return <Loader />;
  }

  if (status === "unauthenticated" && !isAuthRoute) {
    return null;
  }

  if (status === "authenticated" && isAuthRoute) {
    return null;
  }

  return <>{children}</>;
}
