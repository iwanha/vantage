"use client";

import { useTableParams } from "./table-params";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Props {
  paramKey: string;
  value: string;
  allLabel: string;
  options: { value: string; label: string }[];
  width?: string;
}

export function FilterSelect({
  paramKey,
  value,
  allLabel,
  options,
  width = "w-40",
}: Props) {
  const { setParams } = useTableParams();
  const labelFor = (v: unknown) =>
    v === "all" ? allLabel : (options.find((o) => o.value === v)?.label ?? String(v));

  return (
    <Select
      value={value}
      onValueChange={(v) => setParams({ [paramKey]: v === "all" ? null : v, page: 1 })}
    >
      <SelectTrigger className={width} aria-label={allLabel}>
        <SelectValue>{(v) => labelFor(v)}</SelectValue>
      </SelectTrigger>
      <SelectContent className="max-h-64">
        <SelectItem value="all">{allLabel}</SelectItem>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
