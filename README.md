# BlackNexus

Loja/painel para venda de **assinaturas digitais de streaming** e **serviços para redes sociais**
(seguidores, curtidas, visualizações, comentários). Pagamento via **Pix (Mercado Pago)** com
confirmação automática por webhook. Entrega **manual** pelo painel administrativo.

**Stack:** Next.js 16 (App Router) · Supabase (Postgres + Auth + Storage + RLS) · Mercado Pago · Vercel.

---

## 1. Pré-requisitos

- Node 18+ (testado com Node 24)
- Conta no [Supabase](https://supabase.com) e no [Mercado Pago Developers](https://www.mercadopago.com.br/developers)

## 2. Configurar o Supabase

1. Crie um novo projeto no Supabase.
2. No **SQL Editor**, rode na ordem:
   - `supabase/migrations/0001_init.sql` (tabelas, RLS, triggers, bucket de Storage)
   - `supabase/migrations/0002_seed.sql` (categorias e produtos de exemplo — opcional)
3. Em **Project Settings → API**, copie a `URL` e a `anon public` key.
4. Em **Project Settings → API → service_role**, copie a `service_role` key (secreta).

## 3. Configurar o Mercado Pago

1. Em **Suas integrações → Credenciais**, copie o **Access Token** (use o de *teste* para validar).
2. Após o deploy, configure o **Webhook** apontando para
   `https://SEU-DOMINIO/api/webhooks/mercadopago` no evento de **Pagamentos**.

## 4. Variáveis de ambiente

Copie `.env.example` para `.env.local` e preencha:

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
MERCADOPAGO_ACCESS_TOKEN=...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## 5. Rodar localmente

```bash
npm install
npm run dev
```

Acesse http://localhost:3000.

## 6. Criar o primeiro admin

1. Crie uma conta normal pelo site (`/cadastro`).
2. No **SQL Editor** do Supabase, promova o usuário:

```sql
update public.profiles set role = 'admin' where email = 'seu@email.com';
```

3. Faça login — o link **Admin** aparecerá na navbar (`/admin`).

## 7. Deploy na Vercel

1. Suba o repositório para o GitHub.
2. Importe o projeto na Vercel.
3. Adicione as mesmas variáveis de ambiente (com `NEXT_PUBLIC_SITE_URL` = URL de produção).
4. Após o deploy, configure a URL do webhook no Mercado Pago (passo 3.2).

---

## Estrutura

```
app/
  page.tsx                     Home (hero, categorias, destaques)
  categoria/[slug]             Lista de produtos por categoria
  produto/[slug]               Detalhe + adicionar ao carrinho
  carrinho                     Carrinho (localStorage)
  checkout                     Gera Pix + polling de confirmação
  login, cadastro              Autenticação Supabase
  conta/...                    Área do cliente (pedidos + entregas)
  admin/...                    Painel admin (produtos, categorias, pedidos, usuários)
  api/checkout                 Cria pedido + pagamento Pix
  api/pedido-status            Polling do status (dono)
  api/webhooks/mercadopago     Confirmação automática do pagamento
lib/
  supabase/{client,server,admin}.ts
  mercadopago.ts, pricing.ts, queries.ts, auth.ts, admin-actions.ts
supabase/migrations/           Schema + seed
proxy.ts                       Refresh de sessão Supabase (antigo middleware)
```

## Fluxo de pedido

1. Cliente adiciona itens ao carrinho e finaliza (precisa estar logado).
2. `/api/checkout` recalcula os preços no servidor, cria o pedido e gera o Pix.
3. Cliente paga; o **webhook** do Mercado Pago marca o pedido como `pago`.
4. O pedido entra na fila do admin (`/admin/pedidos`), que entrega manualmente
   (conclui o serviço SMM ou insere os dados de acesso da assinatura).
5. O cliente vê a entrega em `/conta/pedidos/[id]`.

## Notas

- Os preços são **sempre recalculados no servidor** a partir do banco; o payload do cliente
  nunca é confiado.
- Para SMM o preço é `preço_por_mil × quantidade ÷ 1000`; assinaturas têm preço fixo.
- Funcionalidades fora do MVP (carteira/saldo, cupons, integração automática com fornecedor SMM,
  cartão de crédito) podem ser adicionadas sobre o mesmo schema.
