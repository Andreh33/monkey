"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Loader2, ArrowRight } from "lucide-react";
import { toast } from "sonner";

export default function RegistroPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const data = {
      name: String(fd.get("name") || ""),
      email: String(fd.get("email") || ""),
      phone: String(fd.get("phone") || ""),
      password: String(fd.get("password") || ""),
      confirm: String(fd.get("confirm") || ""),
    };
    if (data.password !== data.confirm) {
      toast.error("Las contraseñas no coinciden");
      setLoading(false);
      return;
    }
    try {
      const res = await fetch("/api/usuario", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const j = await res.json();
        throw new Error(j.error || "Error");
      }
      await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });
      toast.success("Cuenta creada. Bienvenido a MonopatinShop.");
      router.push("/cuenta");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al registrar");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="min-h-[calc(100vh-200px)] grid lg:grid-cols-2">
      <div className="flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-md">
          <p className="eyebrow mb-3">★ NUEVA CUENTA ★</p>
          <h1 className="display-lg mb-3">Únete a MonopatinShop</h1>
          <p className="text-text-secondary mb-8">Crea tu cuenta para gestionar pedidos y reparaciones.</p>

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="label-base">Nombre completo *</label>
              <input name="name" required className="input-base" placeholder="Tu nombre" />
            </div>
            <div>
              <label className="label-base">Email *</label>
              <input name="email" type="email" required className="input-base" placeholder="tu@email.com" />
            </div>
            <div>
              <label className="label-base">Teléfono</label>
              <input name="phone" type="tel" className="input-base" placeholder="+34 600 000 000" />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="label-base">Contraseña *</label>
                <input name="password" type="password" required minLength={6} className="input-base" placeholder="••••••••" />
              </div>
              <div>
                <label className="label-base">Confirmar *</label>
                <input name="confirm" type="password" required minLength={6} className="input-base" placeholder="••••••••" />
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full text-base py-4 disabled:opacity-60">
              {loading ? (<><Loader2 className="w-4 h-4 animate-spin" /> Creando cuenta...</>) : (<>Crear cuenta <ArrowRight className="w-4 h-4" /></>)}
            </button>
          </form>

          <p className="mt-8 text-sm text-text-secondary">
            ¿Ya tienes cuenta? <Link href="/login" className="text-accent-orange hover:underline">Iniciar sesión</Link>
          </p>
        </div>
      </div>

      <div className="hidden lg:block relative overflow-hidden">
        <Image src="/imagenes/local-21.jpeg" alt="MonopatinShop" fill className="object-cover" style={{ filter: "brightness(0.5) saturate(1.2)" }} />
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(255,0,60,0.55) 0%, rgba(255,42,42,0.45) 100%)", mixBlendMode: "multiply" }} />
        <div className="absolute inset-0 flex flex-col justify-end p-12 z-10">
          <p className="eyebrow text-white/80 mb-3">★ TARRAGONA ★</p>
          <h2 className="display-lg text-white">Únete a la<br />tribu eléctrica.</h2>
        </div>
      </div>
    </section>
  );
}
