"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button, Input, Label, Card } from "@/components/ui";

export function CadastroForm() {
  const router = useRouter();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    if (senha.length < 6) {
      setErro("A senha deve ter ao menos 6 caracteres.");
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password: senha,
      options: { data: { nome } },
    });
    if (error) {
      setLoading(false);
      setErro(error.message);
      return;
    }
    // Salva whatsapp no profile (criado pelo trigger).
    if (data.user && whatsapp) {
      await supabase.from("profiles").update({ whatsapp }).eq("id", data.user.id);
    }
    setLoading(false);
    // Se confirmação de e-mail estiver desativada, já há sessão.
    if (data.session) {
      router.push("/conta");
      router.refresh();
    } else {
      setOk(true);
    }
  }

  if (ok) {
    return (
      <Card>
        <p className="text-sm">
          Conta criada! Verifique seu e-mail para confirmar o cadastro e depois{" "}
          <a href="/login" className="text-primary hover:underline">faça login</a>.
        </p>
      </Card>
    );
  }

  return (
    <Card>
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <div>
          <Label>Nome</Label>
          <Input required value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Seu nome" />
        </div>
        <div>
          <Label>E-mail</Label>
          <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="voce@email.com" />
        </div>
        <div>
          <Label>WhatsApp (opcional)</Label>
          <Input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="(11) 99999-9999" />
        </div>
        <div>
          <Label>Senha</Label>
          <Input type="password" required value={senha} onChange={(e) => setSenha(e.target.value)} placeholder="mínimo 6 caracteres" />
        </div>
        {erro && <p className="text-sm text-danger">{erro}</p>}
        <Button type="submit" disabled={loading}>
          {loading ? "Criando..." : "Criar conta"}
        </Button>
      </form>
    </Card>
  );
}
