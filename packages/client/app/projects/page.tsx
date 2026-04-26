"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { listProjects } from "@/api";
import { CreateProjectDialog, ProjectCard } from "@/components/index";
import { Button } from "@/components/ui/button";
import { useT } from "@/i18n";

export default function ProjectsPage() {
  const [open, setOpen] = useState(false);

  const { t } = useT();

  const query = useQuery({
    queryKey: ["projects"],
    queryFn: () => listProjects(),
  });

  return (
    <div className="flex h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="h-screen w-full max-w-[80vw] bg-white dark:bg-black sm:items-start">
        <div className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h1 className="text-xl font-semibold">{t("PROJECTS_PAGE.TITLE")}</h1>
            <Button onClick={() => setOpen(true)}>{t("PROJECTS_PAGE.CREATE")}</Button>
          </div>

          <div className="space-y-2">
            {query.isLoading ? (
              <div className="text-sm text-zinc-600">{t("PROJECTS_PAGE.LOADING")}</div>
            ) : null}

            {(query.data ?? []).map((p) => (
              <ProjectCard key={p._id} project={p} />
            ))}
          </div>

          <CreateProjectDialog open={open} onOpenChange={setOpen} />
        </div>
      </main>
    </div>
  );
}
