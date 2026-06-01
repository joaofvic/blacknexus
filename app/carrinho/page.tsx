import { CarrinhoView } from "./carrinho-view";

export const metadata = { title: "Carrinho — BlackNexus" };

export default function CarrinhoPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-extrabold">Seu carrinho</h1>
      <CarrinhoView />
    </div>
  );
}
