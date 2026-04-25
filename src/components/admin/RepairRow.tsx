"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, MessageCircle, ChevronDown, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

type Repair = {
  id: string;
  name: string;
  email: string;
  phone: string;
  scooterBrand: string;
  scooterModel?: string | null;
  problem: string;
  problemType: string;
  preferred?: string | null;
  status: string;
  notes?: string | null;
  createdAt: Date | string;
};

const STATUSES = ["NEW", "CONTACTED", "IN_PROGRESS", "DONE", "CANCELLED"];
const STATUS_COLORS: Record<string, string> = {
  NEW: "bg-accent-red/15 text-accent-red border-accent-red/40",
  CONTACTED: "bg-warning/15 text-warning border-warning/40",
  IN_PROGRESS: "bg-accent-orange/15 text-accent-orange border-accent-orange/40",
  DONE: "bg-success/15 text-success border-success/40",
  CANCELLED: "bg-text-muted/15 text-text-muted border-text-muted/40",
};

export function RepairRow({ repair }: { repair: Repair }) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState(repair.status);
  const [notes, setNotes] = useState(repair.notes ?? "");
  const router = useRouter();

  async function save() {
    const res = await fetch(`/api/reparaciones/${repair.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, notes }),
    });
    if (res.ok) {
      toast.success("Solicitud actualizada");
      router.refresh();
    } else toast.error("Error");
  }

  async function remove() {
    if (!confirm("¿Eliminar esta solicitud?")) return;
    const res = await fetch(`/api/reparaciones/${repair.id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Eliminada");
      router.refresh();
    }
  }

  const isNew = repair.status === "NEW";
  const phone = repair.phone.replace(/\s+/g, "");

  return (
    <div className={`card-base overflow-hidden ${isNew ? "border-accent-red/50" : ""}`}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-4 p-4 hover:bg-bg-tertiary/30 text-left"
      >
        <div className="flex-1 min-w-0 grid grid-cols-2 sm:grid-cols-5 gap-2 items-center text-sm">
          <div className="font-semibold truncate">{repair.name}</div>
          <div className="text-text-secondary truncate hidden sm:block">{repair.scooterBrand} {repair.scooterModel}</div>
          <div className="text-text-secondary truncate uppercase text-xs font-mono hidden sm:block">{repair.problemType}</div>
          <div className="text-text-muted text-xs font-mono">{new Date(repair.createdAt).toLocaleDateString("es-ES")}</div>
          <div className="text-right">
            <span className={`px-2 py-1 text-[10px] uppercase tracking-widest font-mono rounded-full border ${STATUS_COLORS[repair.status] ?? STATUS_COLORS.NEW}`}>
              {repair.status}
            </span>
          </div>
        </div>
        <ChevronDown className={`w-5 h-5 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-border"
          >
            <div className="p-5 grid lg:grid-cols-2 gap-5">
              <div className="space-y-3">
                <Detail label="Cliente" value={repair.name} />
                <Detail label="Email" value={<a href={`mailto:${repair.email}`} className="hover:text-white">{repair.email}</a>} />
                <Detail label="Teléfono" value={
                  <span className="flex items-center gap-2">
                    <a href={`tel:${phone}`} className="font-mono hover:text-white inline-flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> {repair.phone}</a>
                    <a href={`https://wa.me/${phone.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" className="text-success hover:text-white"><MessageCircle className="w-4 h-4" /></a>
                  </span>
                } />
                <Detail label="Patinete" value={`${repair.scooterBrand} ${repair.scooterModel ?? ""}`} />
                <Detail label="Tipo problema" value={<span className="uppercase font-mono text-xs">{repair.problemType}</span>} />
                {repair.preferred && <Detail label="Horario preferido" value={repair.preferred === "morning" ? "Mañana" : "Tarde"} />}
                <Detail label="Descripción" value={<span className="block whitespace-pre-wrap text-sm">{repair.problem}</span>} />
              </div>

              <div className="space-y-4">
                <div>
                  <label className="label-base">Estado</label>
                  <select value={status} onChange={(e) => setStatus(e.target.value)} className="input-base">
                    {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label-base">Notas internas</label>
                  <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={5} className="input-base resize-y" placeholder="Notas internas, presupuesto, observaciones..." />
                </div>
                <div className="flex gap-2">
                  <button onClick={save} className="btn-primary"><Save className="w-4 h-4" /> Guardar</button>
                  <button onClick={remove} className="btn-outline text-accent-red border-accent-red/40 hover:bg-accent-red/10"><Trash2 className="w-4 h-4" /> Eliminar</button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-widest font-mono text-text-muted">{label}</p>
      <div className="text-sm text-text-secondary mt-0.5">{value}</div>
    </div>
  );
}
