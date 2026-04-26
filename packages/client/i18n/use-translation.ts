"use client";

import { useEffect, useReducer } from "react";
import { initI18n, i18next } from "./config";

initI18n();

/**
 * useT hook — returns translator function and current language.
 * Re-renders the component when language changes.
 */
export function useT() {
  const [, forceTick] = useReducer((v: number) => v + 1, 0);

  useEffect(() => {
    const onChange = () => forceTick();
    i18next.on("languageChanged", onChange);
    // Sync to current language in case languageChanged fired before this effect registered
    forceTick();
    return () => {
      i18next.off("languageChanged", onChange);
    };
  }, []);

  return { t: i18next.t.bind(i18next), language: i18next.language };
}
