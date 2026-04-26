"use client";

import { useEffect, useState, type FC } from "react";
import { initI18n, i18next, type AppLanguage } from "@/i18n";
import "flag-icons/css/flag-icons.min.css";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { useT } from "@/i18n";

type LanguageOption = {
  code: AppLanguage;
  label: string;
  flag: string;
};

const OPTIONS: ReadonlyArray<LanguageOption> = [
  { code: "en", label: "English", flag: "us" },
  { code: "uk", label: "Українська", flag: "ua" },
];
const STORAGE_KEY = "tasks-estimate.language";

/**
 * LanguageSelector — custom dropdown showing flags inside options.
 */
export const LanguageSelector: FC = () => {
  const [language, setLanguage] = useState<AppLanguage>("en");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    initI18n();

    const stored = globalThis?.localStorage?.getItem?.(STORAGE_KEY) ?? null;
    const valid: AppLanguage =
      stored !== null && OPTIONS.some((o) => o.code === stored)
        ? (stored as AppLanguage)
        : "en";
    try {
      globalThis?.localStorage?.setItem?.(STORAGE_KEY, valid);
    } catch {
      // ignore storage errors
    }
    i18next.changeLanguage(valid).catch(() => {
      // ignore change errors
    });
    setLanguage(valid);
    const onChange = (lng: string) => setLanguage(lng as AppLanguage);
    i18next.on("languageChanged", onChange);
    return () => {
      i18next.off("languageChanged", onChange);
    };
  }, []);

  const { t } = useT();

  const current = OPTIONS.find((o) => o.code === language) ?? OPTIONS[0];

  function handleSelect(code: AppLanguage) {
    const STORAGE_KEY = "tasks-estimate.language";
    i18next.changeLanguage(code);
    try {
      if (globalThis.localStorage !== undefined)
        globalThis.localStorage.setItem(STORAGE_KEY, code);
    } catch {
      // ignore localStorage errors
    }
    setOpen(false);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          aria-label={`${t("LANGUAGE_SELECTOR.ARIA")}: ${t(
            `LANGUAGE_SELECTOR.${current.code.toUpperCase()}`,
          )}`}
          variant="ghost"
          size="icon"
          className="p-1 cursor-pointer bg-transparent"
        >
          <span className={`fi fi-${current.flag} text-3xl`} aria-hidden />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        side="top"
        align="end"
        sideOffset={8}
        className="w-36 p-1 gap-0"
      >
        {OPTIONS.map((opt) => (
          <Button
            key={opt.code}
            variant="ghost"
            size="default"
            onClick={() => handleSelect(opt.code)}
            className="cursor-pointer w-full justify-start px-3 py-2"
          >
            <span className={`fi fi-${opt.flag} text-3xl`} aria-hidden />
            <span className="ml-2">
              {t(`LANGUAGE_SELECTOR.${opt.code.toUpperCase()}`)}
            </span>
          </Button>
        ))}
      </PopoverContent>
    </Popover>
  );
};
