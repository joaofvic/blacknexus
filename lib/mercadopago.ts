import { MercadoPagoConfig, Payment } from "mercadopago";

// Cliente Mercado Pago (servidor). Requer MERCADOPAGO_ACCESS_TOKEN.
export function getMercadoPago() {
  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!accessToken) {
    throw new Error("MERCADOPAGO_ACCESS_TOKEN não configurado");
  }
  const config = new MercadoPagoConfig({ accessToken });
  return { config, payment: new Payment(config) };
}

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

  const result = await payment.create({
    body: {
      transaction_amount: Number(params.amount.toFixed(2)),
      description: params.description,
      payment_method_id: "pix",
      external_reference: params.externalReference,
      notification_url: `${process.env.NEXT_PUBLIC_SITE_URL}/api/webhooks/mercadopago`,
      payer: { email: params.email },
    },
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

  const result = await payment.create({
    body: {
      transaction_amount: Number(params.amount.toFixed(2)),
      description: params.description,
      token: params.token,
      payment_method_id: params.paymentMethodId,
      ...(issuerIdNum ? { issuer_id: issuerIdNum } : {}),
      installments: params.installments,
      external_reference: params.externalReference,
      notification_url: `${process.env.NEXT_PUBLIC_SITE_URL}/api/webhooks/mercadopago`,
      payer: {
        email: params.email,
        identification: {
          type: params.identificationType,
          number: params.identificationNumber,
        },
      },
    },
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
