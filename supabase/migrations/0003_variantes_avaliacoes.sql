-- BlackNexus — variantes de produto e avaliações

-- =========================================================
-- Variantes (planos com preço próprio)
-- =========================================================
create table public.produto_variantes (
  id uuid primary key default gen_random_uuid(),
  produto_id uuid not null references public.produtos(id) on delete cascade,
  nome text not null,
  preco numeric(12,2) not null,
  preco_original numeric(12,2),
  duracao text,
  estoque int,
  ordem int not null default 0,
  ativo boolean not null default true,
  created_at timestamptz not null default now()
);

create index produto_variantes_produto_idx on public.produto_variantes(produto_id);

-- =========================================================
-- Avaliações
-- =========================================================
create table public.avaliacoes (
  id uuid primary key default gen_random_uuid(),
  produto_id uuid not null references public.produtos(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  autor_nome text not null,
  nota int not null check (nota between 1 and 5),
  texto text,
  e_fake boolean not null default false,
  created_at timestamptz not null default now()
);

create index avaliacoes_produto_idx on public.avaliacoes(produto_id, created_at desc);
create unique index avaliacoes_um_por_user on public.avaliacoes(produto_id, user_id)
  where user_id is not null;

-- =========================================================
-- pedido_itens: snapshot da variante escolhida
-- =========================================================
alter table public.pedido_itens
  add column variante_id uuid references public.produto_variantes(id) on delete set null,
  add column variante_nome text;

-- =========================================================
-- RLS
-- =========================================================
alter table public.produto_variantes enable row level security;
alter table public.avaliacoes enable row level security;

create policy "variantes: leitura pública" on public.produto_variantes
  for select using (ativo = true or public.is_admin());
create policy "variantes: admin gerencia" on public.produto_variantes
  for all using (public.is_admin()) with check (public.is_admin());

create policy "avaliacoes: leitura pública" on public.avaliacoes
  for select using (true);
create policy "avaliacoes: admin gerencia" on public.avaliacoes
  for all using (public.is_admin()) with check (public.is_admin());
