"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const schema = z.object({
  name: z.string().min(2, "Nombre requerido"),
  email: z.string().email("Email inválido"),
  phone: z.string().optional(),
  message: z.string().min(5, "Cuéntanos más"),
});

type FormData = z.infer<typeof schema>;

export function ContactForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormData) {
    try {
      const res = await fetch("/api/contacto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error();
      toast.success("¡Mensaje enviado! Te respondemos enseguida.");
      reset();
    } catch {
      toast.error("Error al enviar. Llámanos directamente.");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="label-base">Nombre *</label>
        <input {...register("name")} className="input-base" placeholder="Tu nombre" />
        {errors.name && <p className="text-xs text-accent-red mt-1">{errors.name.message}</p>}
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="label-base">Email *</label>
          <input type="email" {...register("email")} className="input-base" placeholder="tu@email.com" />
          {errors.email && <p className="text-xs text-accent-red mt-1">{errors.email.message}</p>}
        </div>
        <div>
          <label className="label-base">Teléfono</label>
          <input type="tel" {...register("phone")} className="input-base" placeholder="+34 600 000 000" />
        </div>
      </div>
      <div>
        <label className="label-base">Mensaje *</label>
        <textarea {...register("message")} rows={6} className="input-base resize-none" placeholder="¿En qué podemos ayudarte?" />
        {errors.message && <p className="text-xs text-accent-red mt-1">{errors.message.message}</p>}
      </div>
      <button type="submit" disabled={isSubmitting} className="btn-primary w-full text-base py-4 disabled:opacity-60">
        {isSubmitting ? (<><Loader2 className="w-4 h-4 animate-spin" /> Enviando...</>) : "Enviar mensaje"}
      </button>
    </form>
  );
}
