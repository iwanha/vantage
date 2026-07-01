"use client";

import { RowActions } from "@/components/data-table/row-actions";
import { deleteCustomer } from "./actions";
import { CustomerFormDialog } from "./customer-form-dialog";
import type { CustomerRow } from "./customers-table";

export function CustomerRowActions({ customer }: { customer: CustomerRow }) {
  return (
    <RowActions
      deleteName={customer.name}
      deletedMessage="Customer deleted"
      deleteDescription="This action cannot be undone. Related orders will also be removed."
      onDelete={() => deleteCustomer(customer.id)}
      renderEdit={(open, onOpenChange) => (
        <CustomerFormDialog
          open={open}
          onOpenChange={onOpenChange}
          mode="edit"
          customer={customer}
        />
      )}
    />
  );
}
