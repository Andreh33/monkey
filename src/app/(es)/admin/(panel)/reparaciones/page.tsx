import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { RepairRow } from "@/components/admin/RepairRow";

const STATUSES = [
  { key: "all", label: "Todas" },
  { key: "NEW", label: "Nuevas" },
  { key: "CONTACTED", label: "Contactadas" },
  { key: "IN_PROGRESS", label: "En curso" },
  { key: "DONE", label: "Hechas" },
  { key: "CANCELLED", label: "Canceladas" },
];

export default async function AdminReparaciones({ searchParams }: { searchParams: { status?: string } }) {
  const filter = searchParams.status ?? "all";
  const where = filter !== "all" ? { status: filter } : undefined;
  const items = await prisma.repairRequest.findMany({ where, orderBy: { createdAt: "desc" } });
  const counts = await Promise.all(
    STATUSES.filter((s) => s.key !== "all").map(async (s) => ({
      key: s.key,
      count: await prisma.repairRequest.count({ where: { status: s.key } }),
    }))
  );
  const total = counts.reduce((acc, c) => acc + c.count, 0);

  return (
    <div>
      <h1 className="display-md mb-2">Solicitudes de reparación</h1>
      <p className="text-text-secondary mb-6">{total} solicitudes en total</p>

      <div className="flex flex-wrap gap-2 mb-6">
        {STATUSES.map((s) => {
          const count = s.key === "all" ? total : counts.find((c) => c.key === s.key)?.count ?? 0;
          const active = filter === s.key;
          return (
            <Link
              key={s.key}
              href={`/admin/reparaciones${s.key === "all" ? "" : `?status=${s.key}`}`}
              className={`px-3 py-1.5 text-xs uppercase tracking-widest font-mono rounded-md border transition-colors ${
                active ? "bg-bg-tertiary border-accent-red text-white" : "border-border text-text-secondary hover:border-accent-orange"
              }`}
            >
              {s.label} <span className="opacity-60 ml-1">{count}</span>
            </Link>
          );
        })}
      </div>

      {items.length === 0 ? (
        <div className="card-base p-12 text-center text-text-muted">No hay solicitudes que mostrar</div>
      ) : (
        <div className="space-y-3">
          {items.map((r) => <RepairRow key={r.id} repair={r} />)}
        </div>
      )}
    </div>
  );
}
