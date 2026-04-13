"use client";

import { useState, useEffect, useId } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  onConfirm: () => Promise<void> | void;
}>;

export function ConfirmDeleteDialog({ open, onOpenChange, title, type, onConfirm }: ConfirmDeleteDialogProps) {
  const [input, setInput] = useState("");
  const [isPending, setIsPending] = useState(false);
  const inputId = useId();
  const matches = input === title;

  useEffect(() => {
    if (!open) setInput("");
  }, [open]);

  const handleConfirm = async () => {
    if (!matches) return;
    try {
      setIsPending(true);
      await onConfirm();
      onOpenChange(false);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm delete</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete "{title}" {type}?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <label htmlFor={inputId} className="text-xs text-muted-foreground block">Type the title to confirm</label>
          <Input id={inputId} value={input} onChange={(e) => setInput(e.target.value)} placeholder={`Type "${title}" to confirm`} />
        </div>

        <DialogFooter>
          <Button variant="outline" type="button" onClick={() => onOpenChange(false)} disabled={isPending}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleConfirm}
            disabled={!matches || isPending}
          >
            {isPending ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
