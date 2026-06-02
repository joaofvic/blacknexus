"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/cart-provider";
import { formatBRL } from "@/lib/format";
import { Button, Card } from "@/components/ui";
import { cn } from "@/lib/cn";
import type { CartItem } from "@/lib/cart-types";

type Metodo = "pix" | "cartao";

interface PixData {
  pedidoId: string;
  total: number;
  qrCode: string | null;
  qrCodeBase64: string | null;
  ticketUrl: string | null;
}

interface CardData {
  pedidoId: string;
  total: number;
  status: string;
}

// ─── CartaoForm ────────────────────────────────────────────────────────────────
// Monta o formulário de cartão via MercadoPago CardForm SDK (iframes seguros).
function CartaoForm({
  total,
  items,
  sdkReady,
  onSuccess,
  onError,
}: {
  total: number;
  items: CartItem[];
  sdkReady: boolean;
  onSuccess: (data: CardData) => void;
  onError: (msg: string) => void;
}) {
  const cardFormRef = useRef<{ unmount: () => void } | null>(null);
  const [montando, setMontando] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!sdkReady) return;

    const timer = setTimeout(() => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const mp = new (window as any).MercadoPago(
          process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY!,
          { locale: "pt-BR" }
        );

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const cf: any = mp.cardForm({
          amount: total.toFixed(2),
          iframe: true,
          form: {
            id: "mp-card-form",
            cardNumber: { id: "mp-cardNumber", placeholder: "Número do cartão" },
            expirationDate: { id: "mp-expiry", placeholder: "MM/AA" },
            securityCode: { id: "mp-cvv", placeholder: "CVV" },
            cardholderName: { id: "mp-holder", placeholder: "Nome como no cartão" },
            issuer: { id: "mp-issuer" },
            installments: { id: "mp-installments" },
            identificationType: { id: "mp-id-type" },
            identificationNumber: { id: "mp-id-number", placeholder: "000.000.000-00" },
            cardholderEmail: { id: "mp-email", placeholder: "seu@email.com" },
          },
          callbacks: {
            onFormMounted: (err: unknown) => {
              if (err) { console.error("CardForm mount:", err); return; }
              setMontando(false);
            },
            onSubmit: async (event: Event) => {
              event.preventDefault();
              const data = cf.getCardFormData();
              if (!data.token) {
                onError("Não foi possível tokenizar o cartão. Verifique os dados.");
                return;
              }
              setLoading(true);
              try {
                const res = await fetch("/api/checkout", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    items: items.map((i) => ({
                      produtoId: i.produtoId,
                      qtd: i.qtd,
                      linkAlvo: i.linkAlvo ?? null,
                      varianteId: i.varianteId ?? null,
                    })),
                    method: "card",
                    cardToken: data.token,
                    paymentMethodId: data.paymentMethodId,
                    issuerId: data.issuerId,
                    installments: Number(data.installments) || 1,
                    email: data.cardholderEmail,
                    identificationType: data.identificationType,
                    identificationNumber: data.identificationNumber,
                  }),
                });
                const result = await res.json();
                if (!res.ok) {
                  onError(result.error ?? "Erro no pagamento.");
                } else {
                  onSuccess(result);
                }
              } catch {
                onError("Falha de conexão. Tente novamente.");
              } finally {
                setLoading(false);
              }
            },
          },
        });

        cardFormRef.current = cf;
      } catch (err) {
        console.error("MP CardForm init error:", err);
        onError("Erro ao inicializar o formulário de cartão.");
      }
    }, 150);

    return () => {
      clearTimeout(timer);
      if (cardFormRef.current) {
        try { cardFormRef.current.unmount(); } catch { /* ignore */ }
        cardFormRef.current = null;
      }
      setMontando(true);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sdkReady]);

  const fieldCls =
    "h-11 w-full rounded-lg border border-border bg-surface-2 overflow-hidden";

  return (
    <form id="mp-card-form" className="flex flex-col gap-3">
      {montando && (
        <p className="py-2 text-center text-sm text-muted">Carregando formulário...</p>
      )}

      <div className={cn("flex flex-col gap-3", montando && "invisible h-0 overflow-hidden")}>
        <div>
          <p className="mb-1.5 text-xs font-medium text-muted">Nome no cartão</p>
          <div id="mp-holder" className={fieldCls} />
        </div>
        <div>
          <p className="mb-1.5 text-xs font-medium text-muted">Número do cartão</p>
          <div id="mp-cardNumber" className={fieldCls} />
        </div>
        <div className="flex gap-3">
          <div className="flex-1">
            <p className="mb-1.5 text-xs font-medium text-muted">Validade</p>
            <div id="mp-expiry" className={fieldCls} />
          </div>
          <div className="flex-1">
            <p className="mb-1.5 text-xs font-medium text-muted">CVV</p>
            <div id="mp-cvv" className={fieldCls} />
          </div>
        </div>
        <div id="mp-issuer" className="hidden" />
        <div>
          <p className="mb-1.5 text-xs font-medium text-muted">Parcelas</p>
          <div id="mp-installments" className={fieldCls} />
        </div>
        <div className="flex gap-3">
          <div className="w-28">
            <p className="mb-1.5 text-xs font-medium text-muted">Tipo doc.</p>
            <div id="mp-id-type" className={fieldCls} />
          </div>
          <div className="flex-1">
            <p className="mb-1.5 text-xs font-medium text-muted">CPF / doc.</p>
            <div id="mp-id-number" className={fieldCls} />
          </div>
        </div>
        <div>
          <p className="mb-1.5 text-xs font-medium text-muted">E-mail</p>
          <div id="mp-email" className={fieldCls} />
        </div>
      </div>

      <Button type="submit" disabled={montando || loading} className="mt-1">
        {loading ? "Processando..." : `Pagar ${formatBRL(total)}`}
      </Button>
    </form>
  );
}

// ─── CheckoutView ──────────────────────────────────────────────────────────────
export function CheckoutView() {
  const { items, total, clear } = useCart();
  const router = useRouter();

  const [metodo, setMetodo] = useState<Metodo>("pix");
  const [sdkReady, setSdkReady] = useState(false);
  const [pix, setPix] = useState<PixData | null>(null);
  const [cardData, setCardData] = useState<CardData | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [pago, setPago] = useState(false);
  const [copiado, setCopiado] = useState(false);

  // Detect SDK already loaded (e.g. fast navigation / HMR)
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (typeof window !== "undefined" && (window as any).MercadoPago) {
      setSdkReady(true);
    }
  }, []);

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
            varianteId: i.varianteId ?? null,
          })),
          method: "pix",
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErro(data.error ?? "Erro ao gerar o pagamento.");
        return;
      }
      setPix(data);
      clear();
    } catch {
      setErro("Falha de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  function handleCardSuccess(data: CardData) {
    clear();
    if (data.status === "approved") {
      setCardData(data);
      setPago(true);
    } else {
      // in_process: mostrar tela de análise + polling
      setCardData(data);
    }
  }

  // Polling — confirma Pix ou cartão em análise
  const pedidoId = pix?.pedidoId ?? cardData?.pedidoId;
  useEffect(() => {
    if (!pedidoId || pago) return;
    const id = setInterval(async () => {
      try {
        const res = await fetch(`/api/pedido-status?pedidoId=${pedidoId}`);
        const data = await res.json();
        if (data.status && data.status !== "aguardando_pagamento") {
          setPago(true);
          clearInterval(id);
        }
      } catch { /* ignore */ }
    }, 4000);
    return () => clearInterval(id);
  }, [pedidoId, pago]);

  function copiar() {
    if (pix?.qrCode) {
      navigator.clipboard.writeText(pix.qrCode);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    }
  }

  const resultadoPedidoId = pix?.pedidoId ?? cardData?.pedidoId;

  // ── Pagamento confirmado
  if (pago) {
    return (
      <Card className="flex flex-col items-center gap-4 text-center">
        <span className="text-5xl">✅</span>
        <h2 className="text-xl font-bold text-success">Pagamento confirmado!</h2>
        <p className="text-sm text-muted">
          Seu pedido foi recebido e já está na fila de processamento.
        </p>
        <div className="flex gap-2">
          <Button onClick={() => router.push(`/conta/pedidos/${resultadoPedidoId}`)}>
            Ver pedido
          </Button>
          <Link href="/" className="rounded-lg border border-border px-4 py-2.5 text-sm">
            Voltar à loja
          </Link>
        </div>
      </Card>
    );
  }

  // ── Cartão em análise
  if (cardData) {
    return (
      <Card className="flex flex-col items-center gap-4 text-center">
        <span className="text-4xl">🔍</span>
        <h2 className="text-lg font-bold">Pagamento em análise</h2>
        <p className="text-sm text-muted">
          Seu pagamento está sendo processado pela operadora do cartão.
          A confirmação pode levar alguns minutos.
        </p>
        <div className="flex items-center gap-2 text-sm text-muted">
          <span className="h-2 w-2 animate-pulse rounded-full bg-warning" />
          Aguardando confirmação...
        </div>
        <Button
          variant="outline"
          onClick={() => router.push(`/conta/pedidos/${cardData.pedidoId}`)}
        >
          Ver pedido
        </Button>
      </Card>
    );
  }

  // ── Pix gerado
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

  // ── Carrinho vazio
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

  // ── Revisão + seleção de método
  return (
    <>
      <Script
        src="https://sdk.mercadopago.com/js/v2"
        strategy="afterInteractive"
        onLoad={() => setSdkReady(true)}
      />

      <Card className="flex flex-col gap-4">
        {/* Itens do carrinho */}
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

        {/* Seletor de método */}
        <div className="flex gap-1.5 rounded-xl border border-border bg-surface-2 p-1">
          {(["pix", "cartao"] as Metodo[]).map((m) => (
            <button
              key={m}
              onClick={() => { setMetodo(m); setErro(null); }}
              className={cn(
                "flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-semibold transition",
                metodo === m
                  ? "bg-primary text-white shadow-sm"
                  : "text-muted hover:text-foreground"
              )}
            >
              {m === "pix" ? "⚡ Pix" : "💳 Cartão"}
            </button>
          ))}
        </div>

        {erro && <p className="text-sm text-danger">{erro}</p>}

        {metodo === "pix" ? (
          <Button onClick={gerarPix} disabled={loading}>
            {loading ? "Gerando Pix..." : "Gerar Pix"}
          </Button>
        ) : sdkReady ? (
          <CartaoForm
            total={total}
            items={items}
            sdkReady={sdkReady}
            onSuccess={handleCardSuccess}
            onError={(msg) => setErro(msg)}
          />
        ) : (
          <p className="py-2 text-center text-sm text-muted">Carregando...</p>
        )}
      </Card>
    </>
  );
}
