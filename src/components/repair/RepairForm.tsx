"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useState } from "react";
import { GradientBorder } from "@/components/shared/GradientBorder";
import { CheckCircle2, Loader2 } from "lucide-react";

const schema = z.object({
  name: z.string().min(2, "Nombre requerido"),
  email: z.string().email("Email inválido"),
  phone: z.string().min(7, "Teléfono requerido"),
  scooterBrand: z.string().min(2, "Marca requerida"),
  scooterModel: z.string().optional(),
  problemType: z.enum(["bateria", "ruedas", "frenos", "motor", "electronica", "otro"]),
  problem: z.string().min(10, "Cuéntanos un poco más"),
  preferred: z.enum(["morning", "afternoon"]).optional(),
});

type FormData = z.infer<typeof schema>;

export function RepairForm() {
  const [done, setDone] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { problemType: "bateria" },
  });

  async function onSubmit(data: FormData) {
    try {
      const res = await fetch("/api/reparaciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error();
      toast.success("¡Solicitud recibida! Te contactaremos en menos de 24h.");
      setDone(true);
      reset();
    } catch {
      toast.error("Error al enviar. Llámanos directamente.");
    }
  }

  if (done) {
    return (
      <GradientBorder>
        <div className="p-12 text-center">
          <CheckCircle2 className="w-14 h-14 text-success mx-auto mb-4" />
          <h3 className="font-display text-3xl tracking-wider mb-3">Solicitud recibida</h3>
          <p className="text-text-secondary leading-relaxed max-w-md mx-auto">
            Hemos recibido tu petición correctamente. Te contactaremos en menos de 24h para concretar la cita y darte el primer presupuesto.
          </p>
          <button onClick={() => setDone(false)} className="btn-outline mt-6">Enviar otra solicitud</button>
        </div>
      </GradientBorder>
    );
  }

  return (
    <GradientBorder>
      <form onSubmit={handleSubmit(onSubmit)} className="p-6 sm:p-8 space-y-5">
        <div>
          <p className="eyebrow">★ FORMULARIO ★</p>
          <h3 className="font-display text-3xl sm:text-4xl tracking-wider mt-2">Pide tu presupuesto</h3>
          <p className="text-text-secondary mt-2 text-sm">Sin compromiso. Diagnóstico gratuito siempre.</p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Nombre completo *" error={errors.name?.message}>
            <input {...register("name")} className="input-base" placeholder="Tu nombre" />
          </Field>
          <Field label="Email *" error={errors.email?.message}>
            <input type="email" {...register("email")} className="input-base" placeholder="tu@email.com" />
          </Field>
          <Field label="Teléfono *" error={errors.phone?.message}>
            <input type="tel" {...register("phone")} className="input-base" placeholder="+34 600 000 000" />
          </Field>
          <Field label="Marca del patinete *" error={errors.scooterBrand?.message}>
            <input {...register("scooterBrand")} className="input-base" placeholder="Xiaomi, Segway, Cecotec..." />
          </Field>
          <Field label="Modelo (opcional)">
            <input {...register("scooterModel")} className="input-base" placeholder="4 Pro, Max G2..." />
          </Field>
          <Field label="Tipo de problema *" error={errors.problemType?.message}>
            <select {...register("problemType")} className="input-base">
              <option value="bateria">🔋 Batería</option>
              <option value="ruedas">🛞 Ruedas / pinchazos</option>
              <option value="frenos">🛑 Frenos</option>
              <option value="motor">⚡ Motor</option>
              <option value="electronica">📱 Electrónica / display</option>
              <option value="otro">🔧 Otro</option>
            </select>
          </Field>
        </div>

        <Field label="Descripción del problema *" error={errors.problem?.message}>
          <textarea {...register("problem")} rows={4} className="input-base resize-none" placeholder="Cuéntanos qué le pasa, cuándo empezó, si has hecho algo... cuanto más detalle, mejor presupuesto." />
        </Field>

        <div>
          <p className="label-base">Preferencia de horario</p>
          <div className="flex gap-3">
            <label className="flex items-center gap-2 px-4 py-3 rounded-md border border-border cursor-pointer hover:border-accent-orange has-[:checked]:border-accent-red has-[:checked]:bg-accent-red/10 transition-all">
              <input type="radio" value="morning" {...register("preferred")} className="accent-accent-red" />
              <span className="text-sm">Mañana</span>
            </label>
            <label className="flex items-center gap-2 px-4 py-3 rounded-md border border-border cursor-pointer hover:border-accent-orange has-[:checked]:border-accent-red has-[:checked]:bg-accent-red/10 transition-all">
              <input type="radio" value="afternoon" {...register("preferred")} className="accent-accent-red" />
              <span className="text-sm">Tarde</span>
            </label>
          </div>
        </div>

        <button type="submit" disabled={isSubmitting} className="btn-primary w-full text-base py-4 disabled:opacity-60">
          {isSubmitting ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Enviando...</>
          ) : (
            <>Enviar solicitud</>
          )}
        </button>
        <p className="text-[11px] text-text-muted text-center">
          Te contactaremos en menos de 24h. Tus datos solo se usan para gestionar tu solicitud.
        </p>
      </form>
    </GradientBorder>
  );
}

function Field({
  label,
  children,
  error,
}: {
  label: string;
  children: React.ReactNode;
  error?: string;
}) {
  return (
    <div>
      <label className="label-base">{label}</label>
      {children}
      {error && <p className="text-xs text-accent-red mt-1.5">{error}</p>}
    </div>
  );
}
