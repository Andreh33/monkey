import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as { role: string }).role !== "ADMIN") {
    redirect("/admin/login");
  }
  return (
    <div className="flex min-h-screen bg-bg-primary">
      <AdminSidebar />
      <div className="flex-1 overflow-x-hidden">
        <div className="p-6 lg:p-10 max-w-[1280px]">{children}</div>
      </div>
    </div>
  );
}
