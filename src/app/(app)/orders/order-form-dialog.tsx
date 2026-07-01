"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { capitalize } from "@/lib/format";
import { STATUS_ORDER } from "@/lib/status";
import { createOrder, updateOrder } from "./actions";
import type { OrderRow } from "./orders-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";

const schema = z.object({
  customer_id: z.string().uuid("Pick a customer"),
  status: z.enum(STATUS_ORDER),
  total_amount: z.number({ message: "Enter an amount" }).min(0, "Must be ≥ 0"),
  currency: z.string().trim().min(1).max(8),
});
type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  order?: OrderRow;
  customers: { id: string; name: string }[];
}

export function OrderFormDialog({
  open,
  onOpenChange,
  mode,
  order,
  customers,
}: Props) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: standardSchemaResolver(schema),
    defaultValues: {
      customer_id: order?.customer_id ?? "",
      status: (order?.status as FormValues["status"]) ?? "pending",
      total_amount: order?.total_amount ?? 0,
      currency: order?.currency ?? "USD",
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        customer_id: order?.customer_id ?? "",
        status: (order?.status as FormValues["status"]) ?? "pending",
        total_amount: order?.total_amount ?? 0,
        currency: order?.currency ?? "USD",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  async function onSubmit(values: FormValues) {
    const result =
      mode === "create"
        ? await createOrder(values)
        : await updateOrder(order!.id, values);

    if (result.ok) {
      toast.success(mode === "create" ? "Order created" : "Order updated");
      onOpenChange(false);
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "New order" : `Edit ${order?.order_number}`}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Add a new order to the book."
              : "Update this order's details."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="customer">Customer</Label>
            <Controller
              control={control}
              name="customer_id"
              render={({ field }) => (
                <Combobox
                  items={customers}
                  value={customers.find((c) => c.id === field.value) ?? null}
                  onValueChange={(c) => field.onChange(c?.id ?? "")}
                  itemToStringLabel={(c) => c.name}
                >
                  <ComboboxInput id="customer" placeholder="Search customer…" />
                  <ComboboxContent>
                    <ComboboxEmpty>No customer found.</ComboboxEmpty>
                    <ComboboxList>
                      {(c) => (
                        <ComboboxItem key={c.id} value={c}>
                          {c.name}
                        </ComboboxItem>
                      )}
                    </ComboboxList>
                  </ComboboxContent>
                </Combobox>
              )}
            />
            {errors.customer_id && (
              <p className="text-xs text-destructive">
                {errors.customer_id.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <Controller
                control={control}
                name="status"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="status">
                      <SelectValue>
                        {(value) => capitalize(String(value))}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_ORDER.map((s) => (
                        <SelectItem key={s} value={s}>
                          {capitalize(s)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="currency">Currency</Label>
              <Input id="currency" {...register("currency")} />
              {errors.currency && (
                <p className="text-xs text-destructive">
                  {errors.currency.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="total">Total amount</Label>
            <Input
              id="total"
              type="number"
              step="0.01"
              {...register("total_amount", { valueAsNumber: true })}
            />
            {errors.total_amount && (
              <p className="text-xs text-destructive">
                {errors.total_amount.message}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 size-4 animate-spin" />}
              {mode === "create" ? "Create order" : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
