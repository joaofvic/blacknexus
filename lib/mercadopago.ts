import { MercadoPagoConfig, Payment } from "mercadopago";
import { randomUUID } from "crypto";

// Cliente Mercado Pago (servidor). Requer MERCADOPAGO_ACCESS_TOKEN.
export function getMercadoPago() {
  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!accessToken) {
    throw new Error("MERCADOPAGO_ACCESS_TOKEN não configurado");
  }
  const config = new MercadoPagoConfig({ accessToken });
  return { config, payment: new Payment(config) };
}

// Resolve a URL pública para o webhook. Só retorna se for HTTPS pública —
// MP rejeita notification_url ausente é OK, mas com URL inválida (http/localhost)
// a criação do pagamento falha.
function resolveNotificationUrl(): string | undefined {
  const candidates = [
    process.env.NEXT_PUBLIC_SITE_URL,
    process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : undefined,
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined,
  ];
  for (const raw of candidates) {
    if (!raw) continue;
    try {
      const u = new URL(raw);
      if (u.protocol === "https:" && !u.hostname.includes("localhost") && !u.hostname.startsWith("127.")) {
        return `${u.origin}/api/webhooks/mercadopago`;
      }
    } catch {
      /* ignore */
    }
  }
  return undefined;
}

// Extrai mensagem útil de erros do SDK do MP (que costumam vir como ApiResponse
// com `cause` e `message`), para logging e debug.
function describeMpError(e: unknown): string {
  if (!e) return "Erro desconhecido";
  if (typeof e === "string") return e;
  const obj = e as Record<string, unknown>;
  const parts: string[] = [];
  if (typeof obj.message === "string") parts.push(obj.message);
  if (typeof obj.status === "number") parts.push(`status=${obj.status}`);
  const cause = obj.cause;
  if (Array.isArray(cause)) {
    for (const c of cause) {
      const cc = c as Record<string, unknown>;
      if (cc?.description) parts.push(String(cc.description));
      else if (cc?.message) parts.push(String(cc.message));
      else parts.push(JSON.stringify(c));
    }
  } else if (cause) {
    parts.push(typeof cause === "string" ? cause : JSON.stringify(cause));
  }
  if (parts.length === 0) {
    try { return JSON.stringify(e); } catch { return String(e); }
  }
  return parts.join(" | ");
}
export { describeMpError };

export interface PixPaymentResult {
  mpPaymentId: string;
  status: string;
  qrCode: string | null;
  qrCodeBase64: string | null;
  ticketUrl: string | null;
  expiresAt: string | null;
}

// Cria um pagamento Pix e retorna o QR Code (copia-e-cola + base64).
export async function createPixPayment(params: {
  amount: number;
  description: string;
  email: string;
  externalReference: string;
}): Promise<PixPaymentResult> {
  const { payment } = getMercadoPago();

  const notificationUrl = resolveNotificationUrl();
  const result = await payment.create({
    body: {
      transaction_amount: Number(params.amount.toFixed(2)),
      description: params.description,
      payment_method_id: "pix",
      external_reference: params.externalReference,
      ...(notificationUrl ? { notification_url: notificationUrl } : {}),
      payer: {
        email: params.email,
        first_name: "Cliente",
        last_name: "BlackNexus",
      },
    },
    requestOptions: { idempotencyKey: randomUUID() },
  });

  const tx = result.point_of_interaction?.transaction_data;
  return {
    mpPaymentId: String(result.id),
    status: result.status ?? "pending",
    qrCode: tx?.qr_code ?? null,
    qrCodeBase64: tx?.qr_code_base64 ?? null,
    ticketUrl: tx?.ticket_url ?? null,
    expiresAt: result.date_of_expiration ?? null,
  };
}

export interface CardPaymentResult {
  mpPaymentId: string;
  status: string;
  statusDetail: string | null;
}

// Cria um pagamento via cartão de crédito/débito (checkout transparente).
export async function createCardPayment(params: {
  amount: number;
  description: string;
  token: string;
  paymentMethodId: string;
  issuerId: string;
  installments: number;
  email: string;
  identificationType: string;
  identificationNumber: string;
  externalReference: string;
}): Promise<CardPaymentResult> {
  const { payment } = getMercadoPago();
  const issuerIdNum = params.issuerId ? Number(params.issuerId) : undefined;

  const notificationUrl = resolveNotificationUrl();
  const result = await payment.create({
    body: {
      transaction_amount: Number(params.amount.toFixed(2)),
      description: params.description,
      token: params.token,
      payment_method_id: params.paymentMethodId,
      ...(issuerIdNum ? { issuer_id: issuerIdNum } : {}),
      installments: params.installments,
      external_reference: params.externalReference,
      ...(notificationUrl ? { notification_url: notificationUrl } : {}),
      payer: {
        email: params.email,
        identification: {
          type: params.identificationType,
          number: params.identificationNumber,
        },
      },
    },
    requestOptions: { idempotencyKey: randomUUID() },
  });

  return {
    mpPaymentId: String(result.id),
    status: result.status ?? "pending",
    statusDetail: (result as any).status_detail ?? null,
  };
}

// Consulta o status atual de um pagamento.
export async function getPaymentStatus(mpPaymentId: string) {
  const { payment } = getMercadoPago();
  const result = await payment.get({ id: mpPaymentId });
  return {
    status: result.status ?? "pending",
    externalReference: result.external_reference ?? null,
  };
}
