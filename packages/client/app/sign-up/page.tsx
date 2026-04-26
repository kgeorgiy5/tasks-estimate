"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { JSX } from "react";
import { signUp } from "@/api/users";
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

type FormSubmitEvent =
  Parameters<NonNullable<JSX.IntrinsicElements["form"]["onSubmit"]>>[0];

const UNKNOWN_ERROR_MESSAGE = "Unable to sign up";

/**
 * Renders the sign-up page and submits registration data.
 */
export default function SignUpPage(): JSX.Element {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { t } = useT();

  /**
   * Submits sign-up data and redirects to home on success.
   */
  async function handleSubmit(event: FormSubmitEvent): Promise<void> {
    event.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      await signUp({ email, password, confirmPassword });
      router.replace(NavigationPaths.HOME);
    } catch (error) {
      try {
        setErrorMessage(parseErrorCode(error) ?? t("SIGN_UP.UNKNOWN_ERROR"));
      } catch {
        setErrorMessage(t("SIGN_UP.UNKNOWN_ERROR"));
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{t("SIGN_UP.TITLE")}</CardTitle>
          <CardDescription>{t("SIGN_UP.DESCRIPTION")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-3" onSubmit={handleSubmit}>
            <div className="space-y-1.5">
              <Label htmlFor="email">{t("SIGN_UP.EMAIL")}</Label>
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
              <Label htmlFor="password">{t("SIGN_UP.PASSWORD")}</Label>
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword">{t("SIGN_UP.CONFIRM_PASSWORD")}</Label>
              <Input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                required
              />
            </div>
            {errorMessage ? (
              <p className="text-xs text-destructive">{errorMessage}</p>
            ) : null}
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? t("SIGN_UP.SIGNING_UP") : t("SIGN_UP.SIGN_UP")}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-between gap-3">
          <p className="text-xs text-muted-foreground">{t("SIGN_UP.HAVE_ACCOUNT")}</p>
          <Button variant="outline" asChild>
            <Link href={NavigationPaths.SIGN_IN}>{t("SIGN_UP.GO_TO_SIGN_IN")}</Link>
          </Button>
        </CardFooter>
      </Card>
    </main>
  );
}
