import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/components/cart-provider";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { createClient } from "@/lib/supabase/server";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "BlackNexus — Assinaturas e serviços para redes sociais",
  description:
    "Assinaturas de streaming, seguidores, curtidas, visualizações e comentários para todas as redes sociais. Pague com Pix.",
};

async function getCategorias() {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("categorias")
      .select("nome, slug")
      .eq("ativo", true)
      .order("ordem");
    return data ?? [];
  } catch {
    return [];
  }
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const categorias = await getCategorias();

  return (
    <html lang="pt-BR" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <CartProvider>
          <Navbar categorias={categorias} />
          <main className="flex-1">{children}</main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
