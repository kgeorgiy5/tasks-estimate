"use client";

import { useState, useEffect, useId } from "react";
import { useT } from "@/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type ConfirmDeleteDialogProps = Readonly<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  type: string;
  onConfirm: (cascade?: boolean) => Promise<void> | void;
}>;

/**
 * ConfirmDeleteDialog — dialog to confirm destructive deletion actions.
 */
export function ConfirmDeleteDialog({ open, onOpenChange, title, type, onConfirm }: ConfirmDeleteDialogProps) {
  const [input, setInput] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [cascade, setCascade] = useState(false);
  const inputId = useId();
  const matches = input === title;
  const { t } = useT();

  useEffect(() => {
    if (!open) setInput("");
  }, [open]);

  const handleConfirm = async () => {
    if (!matches) return;
    try {
      setIsPending(true);
      await onConfirm(cascade);
      onOpenChange(false);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("CONFIRM_DELETE_DIALOG.TITLE")}</DialogTitle>
          <DialogDescription>
            {t("CONFIRM_DELETE_DIALOG.DESCRIPTION", { title, type })}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <label htmlFor={inputId} className="text-xs text-muted-foreground block">{t("CONFIRM_DELETE_DIALOG.TYPE_PROMPT_LABEL")}</label>
          <Input id={inputId} value={input} onChange={(e) => setInput(e.target.value)} placeholder={t("CONFIRM_DELETE_DIALOG.INPUT_PLACEHOLDER", { title })} />
        </div>

        <label className="flex items-center gap-2 mt-3 cursor-pointer">
          <Checkbox
            id={`${inputId}-cascade`}
            checked={cascade}
            className="cursor-pointer"
            onCheckedChange={(v) => setCascade(Boolean(v))}
          />
          <span className="text-sm select-none">{t("CONFIRM_DELETE_DIALOG.CASCADE_LABEL", { type })}</span>
        </label>

        <DialogFooter>
          <Button variant="outline" type="button" onClick={() => onOpenChange(false)} disabled={isPending}>
            {t("CONFIRM_DELETE_DIALOG.CANCEL")}
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleConfirm}
            disabled={!matches || isPending}
          >
            {isPending ? t("CONFIRM_DELETE_DIALOG.DELETING") : t("CONFIRM_DELETE_DIALOG.DELETE")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
