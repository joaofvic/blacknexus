-- Seed de exemplo (categorias + alguns produtos). Ajuste/remova à vontade.

insert into public.categorias (nome, slug, tipo, icone, ordem) values
  ('Streaming', 'streaming', 'streaming', '🎬', 1),
  ('Instagram', 'instagram', 'social', '📸', 2),
  ('TikTok', 'tiktok', 'social', '🎵', 3),
  ('YouTube', 'youtube', 'social', '▶️', 4),
  ('Variedades', 'variedades', 'variedades', '✨', 5)
on conflict (slug) do nothing;

-- Assinaturas de streaming
insert into public.produtos (categoria_id, nome, slug, descricao, tipo, preco, preco_original, duracao, destaque)
select c.id, 'Netflix Premium 4K', 'netflix-premium-30d',
       'Tela Netflix Premium 4K com 30 dias de garantia. Entrega após confirmação do pagamento.',
       'assinatura', 18.90, 44.90, '30 dias', true
from public.categorias c where c.slug = 'streaming'
on conflict (slug) do nothing;

insert into public.produtos (categoria_id, nome, slug, descricao, tipo, preco, preco_original, duracao, destaque)
select c.id, 'Spotify Premium', 'spotify-premium-30d',
       'Spotify Premium individual por 30 dias.',
       'assinatura', 12.90, 21.90, '30 dias', true
from public.categorias c where c.slug = 'streaming'
on conflict (slug) do nothing;

-- Serviços SMM
insert into public.produtos (categoria_id, nome, slug, descricao, tipo, preco_por_mil, preco_original, qtd_min, qtd_max, rede_social, destaque)
select c.id, 'Seguidores Instagram', 'seguidores-instagram',
       'Seguidores brasileiros de qualidade. Informe o @ do perfil (perfil público).',
       'servico', 9.90, 19.90, 100, 100000, 'instagram', true
from public.categorias c where c.slug = 'instagram'
on conflict (slug) do nothing;

insert into public.produtos (categoria_id, nome, slug, descricao, tipo, preco_por_mil, preco_original, qtd_min, qtd_max, rede_social)
select c.id, 'Curtidas Instagram', 'curtidas-instagram',
       'Curtidas em fotos/reels. Informe o link da publicação.',
       'servico', 4.50, 8.90, 50, 50000, 'instagram'
from public.categorias c where c.slug = 'instagram'
on conflict (slug) do nothing;

insert into public.produtos (categoria_id, nome, slug, descricao, tipo, preco_por_mil, preco_original, qtd_min, qtd_max, rede_social, destaque)
select c.id, 'Visualizações TikTok', 'views-tiktok',
       'Visualizações para seus vídeos. Informe o link do vídeo.',
       'servico', 1.90, 3.90, 1000, 1000000, 'tiktok', true
from public.categorias c where c.slug = 'tiktok'
on conflict (slug) do nothing;

insert into public.produtos (categoria_id, nome, slug, descricao, tipo, preco_por_mil, preco_original, qtd_min, qtd_max, rede_social)
select c.id, 'Inscritos YouTube', 'inscritos-youtube',
       'Inscritos para seu canal. Informe o link do canal.',
       'servico', 29.90, 49.90, 100, 50000, 'youtube'
from public.categorias c where c.slug = 'youtube'
on conflict (slug) do nothing;
