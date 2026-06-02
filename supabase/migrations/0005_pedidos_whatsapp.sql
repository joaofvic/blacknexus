-- WhatsApp por pedido (capturado no checkout, separado de profiles.whatsapp).
alter table public.pedidos
  add column if not exists whatsapp text;

comment on column public.pedidos.whatsapp is
  'Número de WhatsApp informado no checkout (somente dígitos).';
