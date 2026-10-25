import { prisma } from "@/lib/prisma";
import { UserRow } from "@/components/admin/UserRow";

export default async function AdminUsuarios() {
  const users = await prisma.user.findMany({ orderBy: { createdAt: "desc" } });
  return (
    <div>
      <h1 className="display-md mb-2">Usuarios</h1>
      <p className="text-text-secondary mb-8">{users.length} usuarios registrados</p>

      <div className="card-base overflow-hidden">
        <table className="w-full">
          <thead className="bg-bg-tertiary">
            <tr className="text-left text-xs uppercase tracking-widest font-mono text-text-muted">
              <th className="px-4 py-3">Nombre</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Registrado</th>
              <th className="px-4 py-3">Rol</th>
              <th className="px-4 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => <UserRow key={u.id} user={u} />)}
          </tbody>
        </table>
      </div>
    </div>
  );
}
