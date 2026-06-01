import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-24 text-center">
      <div className="text-6xl">🛸</div>
      <h1 className="text-2xl font-extrabold">Página não encontrada</h1>
      <p className="text-muted">O conteúdo que você procura não existe ou foi movido.</p>
      <Link
        href="/"
        className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground"
      >
        Voltar ao início
      </Link>
    </div>
  );
}
