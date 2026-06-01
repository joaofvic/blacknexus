export type NavItem = {
  href: string;
  label: string;
  icon: "dashboard" | "orders" | "products" | "categories" | "users";
};

export const ADMIN_NAV: NavItem[] = [
  { href: "/admin", label: "Resumo", icon: "dashboard" },
  { href: "/admin/pedidos", label: "Pedidos", icon: "orders" },
  { href: "/admin/produtos", label: "Produtos", icon: "products" },
  { href: "/admin/categorias", label: "Categorias", icon: "categories" },
  { href: "/admin/usuarios", label: "Usuários", icon: "users" },
];

export const BREADCRUMB_LABELS: Record<string, string> = {
  admin: "Resumo",
  pedidos: "Pedidos",
  produtos: "Produtos",
  categorias: "Categorias",
  usuarios: "Usuários",
};
