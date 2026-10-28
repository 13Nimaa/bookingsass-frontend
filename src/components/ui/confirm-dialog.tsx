"use client";

import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "danger" | "primary";
  loading?: boolean;
  onConfirm: () => void;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "تأیید",
  cancelLabel = "انصراف",
  tone = "danger",
  loading = false,
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md" showClose={false}>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription className="mt-2">{description}</DialogDescription>
        <DialogFooter className="mt-6">
          <Button
            type="button"
            variant="ghost"
            size="lg"
            className="h-11 px-5"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant={tone === "danger" ? "destructive" : "default"}
            size="lg"
            className="h-11 px-5 font-bold"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
