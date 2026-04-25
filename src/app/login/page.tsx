"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Loader2, ArrowRight } from "lucide-react";
import { toast } from "sonner";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-accent-orange" /></div>}>
      <LoginInner />
    </Suspense>
  );
}

function LoginInner() {
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = params.get("from") || "/cuenta";
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
      toast.error("Credenciales inválidas");
    } else {
      toast.success("Bienvenido de vuelta");
      router.push(callbackUrl);
      router.refresh();
    }
  }

  return (
    <section className="min-h-[calc(100vh-200px)] grid lg:grid-cols-2">
      <div className="flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-md">
          <p className="eyebrow mb-3">★ ÁREA CLIENTE ★</p>
          <h1 className="display-lg mb-3">Iniciar sesión</h1>
          <p className="text-text-secondary mb-8">Accede a tu cuenta para ver tus pedidos y direcciones.</p>

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="label-base">Email</label>
              <input name="email" type="email" required className="input-base" placeholder="tu@email.com" />
            </div>
            <div>
              <label className="label-base">Contraseña</label>
              <input name="password" type="password" required className="input-base" placeholder="••••••••" />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full text-base py-4 disabled:opacity-60">
              {loading ? (<><Loader2 className="w-4 h-4 animate-spin" /> Entrando...</>) : (<>Entrar <ArrowRight className="w-4 h-4" /></>)}
            </button>
          </form>

          <div className="mt-8 flex flex-col gap-3 text-sm">
            <Link href="/registro" className="text-text-secondary hover:text-white transition-colors">
              ¿No tienes cuenta? <span className="text-accent-orange">Regístrate</span>
            </Link>
            <p className="text-text-muted text-xs">
              Demo: <span className="font-mono">cliente@demo.es</span> / <span className="font-mono">Demo1234!</span>
            </p>
          </div>
        </div>
      </div>

      <div className="hidden lg:block relative overflow-hidden">
        <Image src="/imagenes/local-19.jpeg" alt="MonkeyMotion" fill className="object-cover" style={{ filter: "brightness(0.5) saturate(1.2)" }} />
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(255,42,42,0.6) 0%, rgba(198,21,21,0.4) 100%)", mixBlendMode: "multiply" }} />
        <div className="absolute inset-0 flex flex-col justify-end p-12 z-10">
          <p className="eyebrow text-white/80 mb-3">★ MONKEYMOTION ★</p>
          <h2 className="display-lg text-white">Bienvenido<br />de vuelta.</h2>
          <p className="mt-4 text-white/85 text-lg max-w-md">Tu patinete te espera. Tus pedidos también.</p>
        </div>
      </div>
    </section>
  );
}
