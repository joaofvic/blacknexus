import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-border bg-surface/40">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-3">
        <div>
          <div className="text-lg font-extrabold">
            Black<span className="text-primary">Nexus</span>
          </div>
          <p className="mt-2 text-sm text-muted">
            Assinaturas digitais e serviços para redes sociais com entrega rápida e suporte.
          </p>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold">Loja</h4>
          <ul className="space-y-2 text-sm text-muted">
            <li><Link href="/" className="hover:text-foreground">Início</Link></li>
            <li><Link href="/carrinho" className="hover:text-foreground">Carrinho</Link></li>
            <li><Link href="/conta/pedidos" className="hover:text-foreground">Meus pedidos</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold">Pagamento</h4>
          <p className="text-sm text-muted">Pix via Mercado Pago — confirmação automática.</p>
        </div>
      </div>
      <div className="border-t border-border py-4 text-center text-xs text-muted">
        © {new Date().getFullYear()} BlackNexus. Todos os direitos reservados.
      </div>
    </footer>
  );
}
