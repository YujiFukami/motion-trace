"use client";

import { useState, type ReactNode } from "react";

export interface SettingsAccordionProps {
  title: string;
  children: ReactNode;
}

export default function SettingsAccordion({
  title,
  children,
}: SettingsAccordionProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="w-full max-w-3xl">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-zinc-200 hover:bg-white/10"
      >
        <span
          className={`inline-block transition-transform ${open ? "rotate-90" : ""}`}
        >
          ▸
        </span>
        {title}
      </button>
      {open && <div className="mt-2 flex flex-col gap-2">{children}</div>}
    </div>
  );
}
