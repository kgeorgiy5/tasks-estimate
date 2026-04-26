"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import type { JSX } from "react";
import { getGoogleAuthUrl, signIn } from "@/api/users";
import { parseErrorCode } from "@tasks-estimate/shared";
import { NavigationPaths } from "@/config/navigation-paths.config";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useT } from "@/i18n";
import { useAuthStore } from "@/stores";
import { HugeiconsIcon } from "@hugeicons/react";
import { GoogleIcon } from "@hugeicons/core-free-icons";
import { LanguageSelector } from "@/components/language-selector";

type FormSubmitEvent = Parameters<
  NonNullable<JSX.IntrinsicElements["form"]["onSubmit"]>
>[0];

/**
 * Renders the sign-in page and submits credentials via backend HTTP API.
 */
export default function SignInPage(): JSX.Element {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { t } = useT();
  const googleAuthUrl = getGoogleAuthUrl();

  useEffect(() => {
    const accessToken = searchParams.get("access_token");

    if (!accessToken) {
      return;
    }

    useAuthStore.getState().setFromToken(accessToken);
    router.replace(NavigationPaths.HOME);
  }, [router, searchParams]);

  /**
   * Submits sign-in credentials and redirects to home on success.
   */
  async function handleSubmit(event: FormSubmitEvent): Promise<void> {
    event.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      await signIn({ email, password });
      router.replace(NavigationPaths.HOME);
    } catch (error) {
      try {
        setErrorMessage(parseErrorCode(error) ?? t("SIGN_IN.UNKNOWN_ERROR"));
      } catch {
        setErrorMessage(t("SIGN_IN.UNKNOWN_ERROR"));
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-start justify-between w-full">
            <div>
              <CardTitle>{t("SIGN_IN.TITLE")}</CardTitle>
              <CardDescription>{t("SIGN_IN.DESCRIPTION")}</CardDescription>
            </div>
            <LanguageSelector />
          </div>
        </CardHeader>
        <CardContent>
          <form className="space-y-3" onSubmit={handleSubmit}>
            <div className="space-y-1.5">
              <Label htmlFor="email">{t("SIGN_IN.EMAIL")}</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">{t("SIGN_IN.PASSWORD")}</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </div>
            {errorMessage ? (
              <p className="text-xs text-destructive">{errorMessage}</p>
            ) : null}
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? t("SIGN_IN.SIGNING_IN") : t("SIGN_IN.SIGN_IN")}
            </Button>
            <Button type="button" variant="outline" className="w-full" asChild>
              <a href={googleAuthUrl}>
                <HugeiconsIcon
                  icon={GoogleIcon}
                  className="h-5! w-5! text-zinc-700 dark:text-zinc-300"
                  strokeWidth={2}
                  aria-hidden
                />
                {t("SIGN_IN.CONTINUE_WITH_GOOGLE")}
              </a>
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            {t("SIGN_IN.NO_ACCOUNT")}
          </p>
          <Button variant="outline" asChild>
            <Link
              href={NavigationPaths.SIGN_UP}
              className="flex items-center gap-2"
            >
              {t("SIGN_IN.GO_TO_SIGN_UP")}
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </main>
  );
}
