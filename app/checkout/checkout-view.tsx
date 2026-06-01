"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/cart-provider";
import { formatBRL } from "@/lib/format";
import { Button, Card } from "@/components/ui";

interface PixData {
  pedidoId: string;
  total: number;
  qrCode: string | null;
  qrCodeBase64: string | null;
  ticketUrl: string | null;
}

export function CheckoutView() {
  const { items, total, clear } = useCart();
  const router = useRouter();
  const [pix, setPix] = useState<PixData | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [pago, setPago] = useState(false);
  const [copiado, setCopiado] = useState(false);

  async function gerarPix() {
    if (items.length === 0) return;
    setLoading(true);
    setErro(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({
            produtoId: i.produtoId,
            qtd: i.qtd,
            linkAlvo: i.linkAlvo,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErro(data.error ?? "Erro ao gerar o pagamento.");
        return;
      }
      setPix(data);
      clear(); // pedido já criado no servidor
    } catch {
      setErro("Falha de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  // Polling do status do pedido até confirmar pagamento.
  useEffect(() => {
    if (!pix?.pedidoId || pago) return;
    const id = setInterval(async () => {
      try {
        const res = await fetch(`/api/pedido-status?pedidoId=${pix.pedidoId}`);
        const data = await res.json();
        if (data.status && data.status !== "aguardando_pagamento") {
          setPago(true);
          clearInterval(id);
        }
      } catch {
        // ignore
      }
    }, 4000);
    return () => clearInterval(id);
  }, [pix, pago]);

  function copiar() {
    if (pix?.qrCode) {
      navigator.clipboard.writeText(pix.qrCode);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    }
  }

  // Estado: pagamento confirmado
  if (pago) {
    return (
      <Card className="flex flex-col items-center gap-4 text-center">
        <span className="text-5xl">✅</span>
        <h2 className="text-xl font-bold text-success">Pagamento confirmado!</h2>
        <p className="text-sm text-muted">
          Seu pedido foi recebido e já está na fila de processamento.
        </p>
        <div className="flex gap-2">
          <Button onClick={() => router.push(`/conta/pedidos/${pix?.pedidoId}`)}>
            Ver pedido
          </Button>
          <Link href="/" className="rounded-lg border border-border px-4 py-2.5 text-sm">
            Voltar à loja
          </Link>
        </div>
      </Card>
    );
  }

  // Estado: Pix gerado
  if (pix) {
    return (
      <Card className="flex flex-col items-center gap-5 text-center">
        <p className="text-sm text-muted">
          Escaneie o QR Code ou use o copia-e-cola. A confirmação é automática.
        </p>
        {pix.qrCodeBase64 && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`data:image/png;base64,${pix.qrCodeBase64}`}
            alt="QR Code Pix"
            className="h-56 w-56 rounded-lg bg-white p-2"
          />
        )}
        <div className="text-2xl font-extrabold text-primary">{formatBRL(pix.total)}</div>

        {pix.qrCode && (
          <div className="w-full">
            <div className="break-all rounded-lg border border-border bg-surface-2 p-3 text-xs text-muted">
              {pix.qrCode}
            </div>
            <Button onClick={copiar} variant="outline" className="mt-2 w-full">
              {copiado ? "Copiado ✓" : "Copiar código Pix"}
            </Button>
          </div>
        )}

        <div className="flex items-center gap-2 text-sm text-muted">
          <span className="h-2 w-2 animate-pulse rounded-full bg-warning" />
          Aguardando pagamento...
        </div>
      </Card>
    );
  }

  // Estado: revisão do carrinho + botão gerar
  if (items.length === 0) {
    return (
      <Card className="text-center">
        <p className="text-muted">Seu carrinho está vazio.</p>
        <Link href="/" className="mt-3 inline-block text-primary hover:underline">
          Voltar à loja
        </Link>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        {items.map((it, i) => (
          <div key={i} className="flex items-center justify-between text-sm">
            <span className="truncate">{it.nome}</span>
            <span className="font-semibold">{formatBRL(it.subtotal)}</span>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between border-t border-border pt-3">
        <span className="text-muted">Total</span>
        <span className="text-xl font-extrabold text-primary">{formatBRL(total)}</span>
      </div>
      {erro && <p className="text-sm text-danger">{erro}</p>}
      <Button onClick={gerarPix} disabled={loading}>
        {loading ? "Gerando Pix..." : "Gerar Pix"}
      </Button>
    </Card>
  );
}
