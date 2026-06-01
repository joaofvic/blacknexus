-- BlackNexus — schema inicial
-- Painel SMM + assinaturas digitais. Entrega manual. Pagamento via Pix (Mercado Pago).

-- =========================================================
-- Tipos enumerados
-- =========================================================
create type categoria_tipo as enum ('streaming', 'social', 'variedades');
create type produto_tipo as enum ('servico', 'assinatura');
create type pedido_status as enum (
  'aguardando_pagamento',
  'pago',
  'em_andamento',
  'concluido',
  'cancelado'
);

-- =========================================================
-- profiles (1:1 com auth.users)
-- =========================================================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nome text,
  email text,
  whatsapp text,
  role text not null default 'cliente' check (role in ('cliente', 'admin')),
  created_at timestamptz not null default now()
);

-- Helper para checar admin sem recursão de RLS
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- Cria o profile automaticamente ao registrar usuário
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, nome, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'nome', new.raw_user_meta_data->>'name'),
    new.email
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =========================================================
-- categorias
-- =========================================================
create table public.categorias (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  slug text not null unique,
  tipo categoria_tipo not null,
  icone text,
  ordem int not null default 0,
  ativo boolean not null default true,
  created_at timestamptz not null default now()
);

-- =========================================================
-- produtos
-- =========================================================
create table public.produtos (
  id uuid primary key default gen_random_uuid(),
  categoria_id uuid references public.categorias(id) on delete set null,
  nome text not null,
  slug text not null unique,
  descricao text,
  imagem_url text,
  tipo produto_tipo not null,
  ativo boolean not null default true,
  destaque boolean not null default false,

  -- serviço (baseado em quantidade)
  preco_por_mil numeric(12,2),
  qtd_min int,
  qtd_max int,
  rede_social text,

  -- assinatura (preço fixo)
  preco numeric(12,2),
  duracao text,
  precisa_link boolean not null default false,

  -- preço promocional ("de/por"): preço original riscado, quando preenchido
  preco_original numeric(12,2),

  created_at timestamptz not null default now()
);

create index produtos_categoria_idx on public.produtos(categoria_id);

-- =========================================================
-- pedidos
-- =========================================================
create table public.pedidos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  status pedido_status not null default 'aguardando_pagamento',
  total numeric(12,2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index pedidos_user_idx on public.pedidos(user_id);
create index pedidos_status_idx on public.pedidos(status);

-- =========================================================
-- pedido_itens
-- =========================================================
create table public.pedido_itens (
  id uuid primary key default gen_random_uuid(),
  pedido_id uuid not null references public.pedidos(id) on delete cascade,
  produto_id uuid references public.produtos(id) on delete set null,
  nome_produto text not null,
  qtd int not null default 1,
  link_alvo text,
  preco_unit numeric(12,2) not null,
  subtotal numeric(12,2) not null,
  conteudo_entregue text,
  entregue_em timestamptz
);

create index pedido_itens_pedido_idx on public.pedido_itens(pedido_id);

-- =========================================================
-- pagamentos
-- =========================================================
create table public.pagamentos (
  id uuid primary key default gen_random_uuid(),
  pedido_id uuid not null references public.pedidos(id) on delete cascade,
  provedor text not null default 'mercadopago',
  mp_payment_id text,
  status text not null default 'pending',
  qr_code text,
  qr_code_base64 text,
  ticket_url text,
  valor numeric(12,2) not null,
  expira_em timestamptz,
  created_at timestamptz not null default now()
);

create index pagamentos_pedido_idx on public.pagamentos(pedido_id);
create index pagamentos_mp_idx on public.pagamentos(mp_payment_id);

-- =========================================================
-- RLS
-- =========================================================
alter table public.profiles enable row level security;
alter table public.categorias enable row level security;
alter table public.produtos enable row level security;
alter table public.pedidos enable row level security;
alter table public.pedido_itens enable row level security;
alter table public.pagamentos enable row level security;

-- profiles
create policy "profiles: ler próprio" on public.profiles
  for select using (auth.uid() = id or public.is_admin());
create policy "profiles: editar próprio" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- categorias (leitura pública dos ativos; admin gerencia tudo)
create policy "categorias: leitura pública" on public.categorias
  for select using (ativo = true or public.is_admin());
create policy "categorias: admin gerencia" on public.categorias
  for all using (public.is_admin()) with check (public.is_admin());

-- produtos
create policy "produtos: leitura pública" on public.produtos
  for select using (ativo = true or public.is_admin());
create policy "produtos: admin gerencia" on public.produtos
  for all using (public.is_admin()) with check (public.is_admin());

-- pedidos (dono lê; admin lê/edita tudo). Inserção/escrita do fluxo usa service role.
create policy "pedidos: dono lê" on public.pedidos
  for select using (auth.uid() = user_id or public.is_admin());
create policy "pedidos: admin gerencia" on public.pedidos
  for all using (public.is_admin()) with check (public.is_admin());

-- pedido_itens
create policy "itens: dono lê" on public.pedido_itens
  for select using (
    public.is_admin() or exists (
      select 1 from public.pedidos p
      where p.id = pedido_id and p.user_id = auth.uid()
    )
  );
create policy "itens: admin gerencia" on public.pedido_itens
  for all using (public.is_admin()) with check (public.is_admin());

-- pagamentos
create policy "pagamentos: dono lê" on public.pagamentos
  for select using (
    public.is_admin() or exists (
      select 1 from public.pedidos p
      where p.id = pedido_id and p.user_id = auth.uid()
    )
  );
create policy "pagamentos: admin gerencia" on public.pagamentos
  for all using (public.is_admin()) with check (public.is_admin());

-- =========================================================
-- Storage: bucket de imagens de produtos
-- =========================================================
insert into storage.buckets (id, name, public)
values ('produtos', 'produtos', true)
on conflict (id) do nothing;

create policy "produtos storage: leitura pública" on storage.objects
  for select using (bucket_id = 'produtos');
create policy "produtos storage: admin escreve" on storage.objects
  for insert with check (bucket_id = 'produtos' and public.is_admin());
create policy "produtos storage: admin atualiza" on storage.objects
  for update using (bucket_id = 'produtos' and public.is_admin());
create policy "produtos storage: admin remove" on storage.objects
  for delete using (bucket_id = 'produtos' and public.is_admin());
