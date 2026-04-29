"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Loader2, Lock } from "lucide-react";
import { toast } from "sonner";

export default function AdminLoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const res = await signIn("credentials", {
      email: String(fd.get("email")),
      password: String(fd.get("password")),
      redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      toast.error("Acceso denegado");
    } else {
      router.push("/admin");
      router.refresh();
    }
  }

  return (
    <section className="min-h-screen flex items-center justify-center bg-bg-primary px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <div className="inline-flex w-16 h-16 rounded-2xl items-center justify-center mb-4" style={{ background: "linear-gradient(135deg, #FF2A2A 0%, #FF8800 100%)" }}>
            <Lock className="w-7 h-7 text-black" />
          </div>
          <p className="eyebrow mb-2">★ ADMIN AREA ★</p>
          <h1 className="display-md">MonopatinShop</h1>
          <p className="text-text-muted text-sm mt-2">Acceso restringido al equipo</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div><label className="label-base">Email</label><input name="email" type="email" required className="input-base" /></div>
          <div><label className="label-base">Contraseña</label><input name="password" type="password" required className="input-base" /></div>
          <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-60">
            {loading ? (<><Loader2 className="w-4 h-4 animate-spin" /> Entrando...</>) : "Entrar"}
          </button>
        </form>

        <p className="mt-8 text-xs text-text-muted text-center font-mono">
          Demo: admin@monopatinshop.es / Monopatin2026!
        </p>
      </div>
    </section>
  );
}
