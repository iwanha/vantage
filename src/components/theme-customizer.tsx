"use client";

import { useEffect, useState } from "react";
import { Palette } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const ACCENTS = [
  { key: "amber", label: "Amber", swatch: "oklch(0.8 0.14 72)" },
  { key: "violet", label: "Violet", swatch: "oklch(0.62 0.2 277)" },
  { key: "blue", label: "Blue", swatch: "oklch(0.66 0.15 250)" },
  { key: "emerald", label: "Emerald", swatch: "oklch(0.7 0.14 162)" },
  { key: "rose", label: "Rose", swatch: "oklch(0.66 0.2 12)" },
];

export function ThemeCustomizer() {
  const [accent, setAccent] = useState("amber");

  useEffect(() => {
    setAccent(localStorage.getItem("accent") || "amber");
  }, []);

  function pick(key: string) {
    setAccent(key);
    localStorage.setItem("accent", key);
    if (key === "amber") delete document.documentElement.dataset.accent;
    else document.documentElement.dataset.accent = key;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(buttonVariants({ variant: "ghost", size: "icon" }))}
        aria-label="Customize accent"
      >
        <Palette className="size-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-auto p-3">
        <p className="mb-2 text-xs font-medium text-muted-foreground">Accent</p>
        <div className="flex gap-2">
          {ACCENTS.map((a) => (
            <button
              key={a.key}
              type="button"
              onClick={() => pick(a.key)}
              aria-label={a.label}
              className={cn(
                "size-7 rounded-full ring-2 ring-offset-2 ring-offset-popover transition-transform hover:scale-110",
                accent === a.key ? "ring-foreground" : "ring-transparent",
              )}
              style={{ background: a.swatch }}
            />
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
