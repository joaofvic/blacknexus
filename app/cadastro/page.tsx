import Link from "next/link";
import { CadastroForm } from "./cadastro-form";

export const metadata = { title: "Criar conta — BlackNexus" };

export default function CadastroPage() {
  return (
    <div className="mx-auto flex max-w-md flex-col gap-6 px-4 py-16">
      <div className="text-center">
        <h1 className="text-2xl font-extrabold">Criar conta</h1>
        <p className="mt-1 text-sm text-muted">É rápido — comece a comprar em segundos.</p>
      </div>
      <CadastroForm />
      <p className="text-center text-sm text-muted">
        Já tem conta?{" "}
        <Link href="/login" className="text-primary hover:underline">
          Entrar
        </Link>
      </p>
    </div>
  );
}
