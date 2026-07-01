"use client";

import { Search } from "lucide-react";
import { useTableParams } from "./table-params";
import { Input } from "@/components/ui/input";

interface Props {
  placeholder: string;
  defaultValue: string;
}

export function TableSearch({ placeholder, defaultValue }: Props) {
  const { debouncedSet } = useTableParams();
  return (
    <div className="relative">
      <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        placeholder={placeholder}
        defaultValue={defaultValue}
        onChange={(e) => debouncedSet({ q: e.target.value || null, page: 1 })}
        className="w-56 pl-8"
        aria-label={placeholder}
      />
    </div>
  );
}
