"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type ActionResult = { ok: true } | { ok: false; error: string };

export function BulkDelete({
  count,
  noun,
  onDelete,
  onDeleted,
}: {
  count: number;
  noun: string;
  onDelete: () => Promise<ActionResult>;
  onDeleted: () => void;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const label = `${count} ${noun}${count === 1 ? "" : "s"}`;

  async function handleDelete() {
    setDeleting(true);
    const result = await onDelete();
    setDeleting(false);
    if (result.ok) {
      toast.success(`${label} deleted`);
      setOpen(false);
      onDeleted();
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="text-destructive hover:text-destructive"
        onClick={() => setOpen(true)}
      >
        <Trash2 className="size-4" />
        Delete
      </Button>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {label}?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={deleting}
              onClick={handleDelete}
            >
              {deleting ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
