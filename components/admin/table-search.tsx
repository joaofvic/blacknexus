"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SearchIcon } from "./icons";

export function TableSearch({
  param = "q",
  placeholder = "Buscar…",
}: {
  param?: string;
  placeholder?: string;
}) {
  const router = useRouter();
  const sp = useSearchParams();
  const [value, setValue] = useState(sp.get(param) ?? "");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setValue(sp.get(param) ?? "");
  }, [sp, param]);

  function commit(next: string) {
    const params = new URLSearchParams(sp.toString());
    if (next.trim()) params.set(param, next.trim());
    else params.delete(param);
    params.delete("page");
    router.replace(`?${params.toString()}`, { scroll: false });
  }

  return (
    <label className="relative flex min-w-[14rem] flex-1 items-center">
      <SearchIcon className="pointer-events-none absolute left-3 text-muted" width={16} height={16} />
      <input
        value={value}
        onChange={(e) => {
          const next = e.target.value;
          setValue(next);
          if (timer.current) clearTimeout(timer.current);
          timer.current = setTimeout(() => commit(next), 300);
        }}
        placeholder={placeholder}
        className="w-full rounded-lg border border-border bg-surface-2 py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-muted outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
      />
    </label>
  );
}
