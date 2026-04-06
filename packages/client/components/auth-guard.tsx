"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "react-toastify";
import { NavigationPaths } from "@/config/navigation-paths.config";
import { Loader } from "./loader";
import { ErrorIds } from "@tasks-estimate/shared";
import "react-toastify/dist/ReactToastify.css";

type AuthGuardProps = {
  children: React.ReactNode;
};

export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const { data: _session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      toast.error(ErrorIds.NOT_AUTHENTICATED);
      router.push(NavigationPaths.LOGIN);
    }
  }, [status, router]);

  if (status === "loading") {
    return <Loader />;
  }

  if (status === "unauthenticated") {
    return null; // Prevent rendering protected content
  }

  return <>{children}</>;
};
