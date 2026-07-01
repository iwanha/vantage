"use client";

import { RowActions } from "@/components/data-table/row-actions";
import { deleteOrder } from "./actions";
import { OrderFormDialog } from "./order-form-dialog";
import type { OrderRow } from "./orders-table";

interface Props {
  order: OrderRow;
  customers: { id: string; name: string }[];
}

export function OrderRowActions({ order, customers }: Props) {
  return (
    <RowActions
      deleteName={order.order_number}
      deletedMessage="Order deleted"
      onDelete={() => deleteOrder(order.id)}
      renderEdit={(open, onOpenChange) => (
        <OrderFormDialog
          open={open}
          onOpenChange={onOpenChange}
          mode="edit"
          order={order}
          customers={customers}
        />
      )}
    />
  );
}
