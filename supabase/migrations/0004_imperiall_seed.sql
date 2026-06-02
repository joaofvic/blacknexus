-- BlackNexus — seed das categorias e produtos do imperiall.cloud
-- Preços e imagens ficam em branco (NULL) para edição posterior pelo admin.
-- Variantes usam preço = 0 como placeholder (coluna NOT NULL).

-- Limpeza: categoria Imperiall foi removida do escopo
delete from public.categorias where slug = 'imperiall';

-- =========================================================
-- Categorias (mapeadas para os 3 tipos existentes do enum)
-- =========================================================
insert into public.categorias (nome, slug, tipo, icone, ordem) values
  ('Streaming',  'streaming',  'streaming',  '🎬', 1),
  ('Edição',     'edicao',     'variedades', '✂️', 2),
  ('IA',         'ia',         'variedades', '🤖', 3),
  ('Steam Key',  'steam-key',  'variedades', '🎮', 4),
  ('Discord',    'discord',    'social',     '💬', 5),
  ('Métodos',    'metodos',    'variedades', '📘', 6),
  ('Utilidades', 'utilidades', 'variedades', '🧰', 7),
  ('Contas',     'contas',     'variedades', '🔑', 8),
  ('Instagram',  'instagram',  'social',     '📸', 9),
  ('Tiktok',     'tiktok',     'social',     '🎵', 10)
on conflict (slug) do nothing;

-- Garantir que Instagram e Tiktok estão ativos (caso já existissem desativados)
update public.categorias set ativo = true where slug in ('instagram', 'tiktok');

-- =========================================================
-- STREAMING
-- =========================================================
insert into public.produtos (categoria_id, nome, slug, tipo)
select c.id, 'PrimeVideo Individual', 'primevideo-individual', 'assinatura'
from public.categorias c where c.slug = 'streaming'
on conflict (slug) do nothing;

insert into public.produto_variantes (produto_id, nome, preco, duracao, ordem)
select p.id, 'PrimeVideo Individual 30 dias', 0, '30 dias', 1
from public.produtos p where p.slug = 'primevideo-individual'
on conflict do nothing;

insert into public.produto_variantes (produto_id, nome, preco, duracao, ordem)
select p.id, 'PrimeVideo Infinita', 0, 'Infinita', 2
from public.produtos p where p.slug = 'primevideo-individual'
on conflict do nothing;

insert into public.produtos (categoria_id, nome, slug, tipo, duracao)
select c.id, 'YouTube Premium', 'youtube-premium', 'assinatura', '30 dias'
from public.categorias c where c.slug = 'streaming'
on conflict (slug) do nothing;

-- =========================================================
-- EDIÇÃO
-- =========================================================
insert into public.produtos (categoria_id, nome, slug, tipo)
select c.id, 'Canva Pro', 'canva-pro', 'assinatura'
from public.categorias c where c.slug = 'edicao'
on conflict (slug) do nothing;

insert into public.produto_variantes (produto_id, nome, preco, duracao, ordem)
select p.id, 'Canva Mensal (Convite)', 0, '30 dias', 1
from public.produtos p where p.slug = 'canva-pro'
  and not exists (
    select 1 from public.produto_variantes v
    where v.produto_id = p.id and v.nome = 'Canva Mensal (Convite)'
  );

insert into public.produto_variantes (produto_id, nome, preco, duracao, ordem)
select p.id, 'Canva Equipe Mensal (até 100 pessoas)', 0, '30 dias', 2
from public.produtos p where p.slug = 'canva-pro'
  and not exists (
    select 1 from public.produto_variantes v
    where v.produto_id = p.id and v.nome = 'Canva Equipe Mensal (até 100 pessoas)'
  );

insert into public.produtos (categoria_id, nome, slug, tipo, duracao)
select c.id, 'Alight Motion Pro 1 Ano (Individual)', 'alight-motion-pro-1-ano', 'assinatura', '1 ano'
from public.categorias c where c.slug = 'edicao'
on conflict (slug) do nothing;

insert into public.produtos (categoria_id, nome, slug, tipo)
select c.id, 'CapCut Pro', 'capcut-pro', 'assinatura'
from public.categorias c where c.slug = 'edicao'
on conflict (slug) do nothing;

-- =========================================================
-- IA
-- =========================================================
insert into public.produtos (categoria_id, nome, slug, tipo, duracao)
select c.id, 'Super Grok 3 Meses', 'super-grok-3-meses', 'assinatura', '3 meses'
from public.categorias c where c.slug = 'ia'
on conflict (slug) do nothing;

insert into public.produtos (categoria_id, nome, slug, tipo)
select c.id, 'Leonardo AI Plano Essential', 'leonardo-ai-plano-essential', 'assinatura'
from public.categorias c where c.slug = 'ia'
on conflict (slug) do nothing;

insert into public.produtos (categoria_id, nome, slug, tipo)
select c.id, 'Chat GPT Plus Promoção Apenas Hoje', 'chat-gpt-plus-promocao', 'assinatura'
from public.categorias c where c.slug = 'ia'
on conflict (slug) do nothing;

-- =========================================================
-- STEAM KEY
-- =========================================================
insert into public.produtos (categoria_id, nome, slug, tipo)
select c.id, 'Steam Key Ouro (R$200+)', 'steam-key-ouro', 'assinatura'
from public.categorias c where c.slug = 'steam-key'
on conflict (slug) do nothing;

insert into public.produtos (categoria_id, nome, slug, tipo)
select c.id, 'Steam Key Diamante (R$600+)', 'steam-key-diamante', 'assinatura'
from public.categorias c where c.slug = 'steam-key'
on conflict (slug) do nothing;

insert into public.produtos (categoria_id, nome, slug, tipo)
select c.id, 'Key Steam Aleatória', 'key-steam-aleatoria', 'assinatura'
from public.categorias c where c.slug = 'steam-key'
on conflict (slug) do nothing;

insert into public.produtos (categoria_id, nome, slug, tipo)
select c.id, 'Steam Key Platina (R$100+)', 'steam-key-platina', 'assinatura'
from public.categorias c where c.slug = 'steam-key'
on conflict (slug) do nothing;

-- =========================================================
-- MÉTODOS
-- =========================================================
insert into public.produtos (categoria_id, nome, slug, tipo)
select c.id, 'Método Giftcards', 'metodo-giftcards', 'assinatura'
from public.categorias c where c.slug = 'metodos'
on conflict (slug) do nothing;

insert into public.produtos (categoria_id, nome, slug, tipo)
select c.id, 'Método Robux', 'metodo-robux', 'assinatura'
from public.categorias c where c.slug = 'metodos'
on conflict (slug) do nothing;

insert into public.produtos (categoria_id, nome, slug, tipo)
select c.id, 'Método Nitro', 'metodo-nitro', 'assinatura'
from public.categorias c where c.slug = 'metodos'
on conflict (slug) do nothing;

insert into public.produtos (categoria_id, nome, slug, tipo)
select c.id, 'Método Steam', 'metodo-steam', 'assinatura'
from public.categorias c where c.slug = 'metodos'
on conflict (slug) do nothing;

insert into public.produtos (categoria_id, nome, slug, tipo)
select c.id, 'Internet Ilimitada', 'internet-ilimitada', 'assinatura'
from public.categorias c where c.slug = 'metodos'
on conflict (slug) do nothing;

-- =========================================================
-- UTILIDADES
-- =========================================================
insert into public.produtos (categoria_id, nome, slug, tipo, duracao)
select c.id, 'Duolingo Super 30 Dias (Individual)', 'duolingo-super-30-dias', 'assinatura', '30 dias'
from public.categorias c where c.slug = 'utilidades'
on conflict (slug) do nothing;

insert into public.produtos (categoria_id, nome, slug, tipo)
select c.id, 'Pack Design Completo', 'pack-design-completo', 'assinatura'
from public.categorias c where c.slug = 'utilidades'
on conflict (slug) do nothing;

insert into public.produtos (categoria_id, nome, slug, tipo)
select c.id, '50K Cortes Virais', '50k-cortes-virais', 'assinatura'
from public.categorias c where c.slug = 'utilidades'
on conflict (slug) do nothing;

insert into public.produtos (categoria_id, nome, slug, tipo)
select c.id, 'Otimização Completa para PC Fraco', 'otimizacao-pc-fraco', 'assinatura'
from public.categorias c where c.slug = 'utilidades'
on conflict (slug) do nothing;

insert into public.produtos (categoria_id, nome, slug, tipo)
select c.id, 'Receber SMS Ilimitado', 'receber-sms-ilimitado', 'assinatura'
from public.categorias c where c.slug = 'utilidades'
on conflict (slug) do nothing;

insert into public.produtos (categoria_id, nome, slug, tipo)
select c.id, 'Pack Ferramentas', 'pack-ferramentas', 'assinatura'
from public.categorias c where c.slug = 'utilidades'
on conflict (slug) do nothing;

insert into public.produtos (categoria_id, nome, slug, tipo)
select c.id, 'Pack de Vídeos Lifestyle Milionário', 'pack-videos-lifestyle-milionario', 'assinatura'
from public.categorias c where c.slug = 'utilidades'
on conflict (slug) do nothing;

insert into public.produtos (categoria_id, nome, slug, tipo)
select c.id, 'Ativação Windows 10 Permanente', 'ativacao-windows-10-permanente', 'assinatura'
from public.categorias c where c.slug = 'utilidades'
on conflict (slug) do nothing;

insert into public.produtos (categoria_id, nome, slug, tipo)
select c.id, '+10.000 Sites Editáveis Premium', '10000-sites-editaveis-premium', 'assinatura'
from public.categorias c where c.slug = 'utilidades'
on conflict (slug) do nothing;

insert into public.produtos (categoria_id, nome, slug, tipo)
select c.id, 'Wallpapers 4K Premium Ilimitados', 'wallpapers-4k-premium-ilimitados', 'assinatura'
from public.categorias c where c.slug = 'utilidades'
on conflict (slug) do nothing;

insert into public.produtos (categoria_id, nome, slug, tipo)
select c.id, 'Pack de IAs', 'pack-de-ias', 'assinatura'
from public.categorias c where c.slug = 'utilidades'
on conflict (slug) do nothing;

-- =========================================================
-- CONTAS
-- =========================================================
insert into public.produtos (categoria_id, nome, slug, tipo)
select c.id, 'Contas Fortnite com V-Bucks', 'contas-fortnite-vbucks', 'assinatura'
from public.categorias c where c.slug = 'contas'
on conflict (slug) do nothing;

insert into public.produto_variantes (produto_id, nome, preco, ordem)
select p.id, '200 V-Bucks', 0, 1
from public.produtos p where p.slug = 'contas-fortnite-vbucks'
  and not exists (select 1 from public.produto_variantes v where v.produto_id = p.id and v.nome = '200 V-Bucks');

insert into public.produto_variantes (produto_id, nome, preco, ordem)
select p.id, '300 V-Bucks', 0, 2
from public.produtos p where p.slug = 'contas-fortnite-vbucks'
  and not exists (select 1 from public.produto_variantes v where v.produto_id = p.id and v.nome = '300 V-Bucks');

insert into public.produto_variantes (produto_id, nome, preco, ordem)
select p.id, '500 V-Bucks', 0, 3
from public.produtos p where p.slug = 'contas-fortnite-vbucks'
  and not exists (select 1 from public.produto_variantes v where v.produto_id = p.id and v.nome = '500 V-Bucks');

insert into public.produtos (categoria_id, nome, slug, tipo)
select c.id, 'Contas Roblox com Robux Gasto', 'contas-roblox-robux-gasto', 'assinatura'
from public.categorias c where c.slug = 'contas'
on conflict (slug) do nothing;

insert into public.produto_variantes (produto_id, nome, preco, ordem)
select p.id, '2000 Robux Gastos', 0, 1
from public.produtos p where p.slug = 'contas-roblox-robux-gasto'
  and not exists (select 1 from public.produto_variantes v where v.produto_id = p.id and v.nome = '2000 Robux Gastos');

insert into public.produto_variantes (produto_id, nome, preco, ordem)
select p.id, '3000 Robux Gastos', 0, 2
from public.produtos p where p.slug = 'contas-roblox-robux-gasto'
  and not exists (select 1 from public.produto_variantes v where v.produto_id = p.id and v.nome = '3000 Robux Gastos');

insert into public.produto_variantes (produto_id, nome, preco, ordem)
select p.id, '4000 Robux Gastos', 0, 3
from public.produtos p where p.slug = 'contas-roblox-robux-gasto'
  and not exists (select 1 from public.produto_variantes v where v.produto_id = p.id and v.nome = '4000 Robux Gastos');

insert into public.produtos (categoria_id, nome, slug, tipo)
select c.id, 'Conta Ubisoft com Jogos', 'conta-ubisoft-com-jogos', 'assinatura'
from public.categorias c where c.slug = 'contas'
on conflict (slug) do nothing;

insert into public.produto_variantes (produto_id, nome, preco, ordem)
select p.id, '10+ Jogos', 0, 1
from public.produtos p where p.slug = 'conta-ubisoft-com-jogos'
  and not exists (select 1 from public.produto_variantes v where v.produto_id = p.id and v.nome = '10+ Jogos');

insert into public.produto_variantes (produto_id, nome, preco, ordem)
select p.id, '20+ Jogos', 0, 2
from public.produtos p where p.slug = 'conta-ubisoft-com-jogos'
  and not exists (select 1 from public.produto_variantes v where v.produto_id = p.id and v.nome = '20+ Jogos');

-- =========================================================
-- INSTAGRAM (categoria já existente do seed inicial)
-- =========================================================
insert into public.produtos (categoria_id, nome, slug, tipo, rede_social)
select c.id, 'Curtidas Brasileiras', 'curtidas-brasileiras-instagram', 'servico', 'instagram'
from public.categorias c where c.slug = 'instagram'
on conflict (slug) do nothing;

insert into public.produtos (categoria_id, nome, slug, tipo, rede_social)
select c.id, 'Visualização Reels', 'visualizacao-reels-instagram', 'servico', 'instagram'
from public.categorias c where c.slug = 'instagram'
on conflict (slug) do nothing;

-- =========================================================
-- TIKTOK (categoria já existente do seed inicial)
-- =========================================================
insert into public.produtos (categoria_id, nome, slug, tipo, rede_social)
select c.id, 'Seguidores Baratos', 'seguidores-baratos-tiktok', 'servico', 'tiktok'
from public.categorias c where c.slug = 'tiktok'
on conflict (slug) do nothing;

insert into public.produtos (categoria_id, nome, slug, tipo, rede_social)
select c.id, 'Seguidores Brasileiros', 'seguidores-brasileiros-tiktok', 'servico', 'tiktok'
from public.categorias c where c.slug = 'tiktok'
on conflict (slug) do nothing;

insert into public.produtos (categoria_id, nome, slug, tipo, rede_social)
select c.id, 'Curtidas Brasileiras', 'curtidas-brasileiras-tiktok', 'servico', 'tiktok'
from public.categorias c where c.slug = 'tiktok'
on conflict (slug) do nothing;

insert into public.produtos (categoria_id, nome, slug, tipo, rede_social)
select c.id, 'Visualizações Vídeo', 'visualizacoes-video-tiktok', 'servico', 'tiktok'
from public.categorias c where c.slug = 'tiktok'
on conflict (slug) do nothing;
