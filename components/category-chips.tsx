import Link from "next/link";
import type { Categoria } from "@/lib/database.types";

export function CategoryChips({ categorias }: { categorias: Categoria[] }) {
  return (
    <div className="chips-scroller -mx-4 overflow-x-auto px-4">
      <div className="flex min-w-max snap-x snap-mandatory items-center gap-2.5 pb-2">
        <Link
          href="/"
          className="chip chip-active flex shrink-0 snap-start items-center rounded-full px-5 py-2.5 text-sm font-bold transition"
        >
          Todos
        </Link>

        {categorias.map((c) => (
          <Link
            key={c.id}
            href={`/categoria/${c.slug}`}
            className="chip flex shrink-0 snap-start items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-muted"
          >
            <span className="uppercase tracking-wide">{c.nome}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
