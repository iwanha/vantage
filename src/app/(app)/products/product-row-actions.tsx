"use client";

import { RowActions } from "@/components/data-table/row-actions";
import { deleteProduct } from "./actions";
import { ProductFormDialog } from "./product-form-dialog";
import type { ProductRow } from "./products-table";

export function ProductRowActions({ product }: { product: ProductRow }) {
  return (
    <RowActions
      deleteName={product.name}
      deletedMessage="Product deleted"
      onDelete={() => deleteProduct(product.id)}
      renderEdit={(open, onOpenChange) => (
        <ProductFormDialog
          open={open}
          onOpenChange={onOpenChange}
          mode="edit"
          product={product}
        />
      )}
    />
  );
}
