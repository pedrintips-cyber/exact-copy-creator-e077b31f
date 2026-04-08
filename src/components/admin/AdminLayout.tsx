import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "./AdminSidebar";

const AdminLayout = () => {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      navigate("/admin/login");
    }
  }, [user, isAdmin, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!user || !isAdmin) return null;

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="admin-theme min-h-screen flex w-full bg-background text-foreground">
        <AdminSidebar />
        <div className="flex-1 flex flex-col min-w-0">
            <header className="h-12 flex items-center border-b bg-background px-3 shrink-0 text-foreground">
            <SidebarTrigger className="mr-3" />
              <span className="text-sm font-medium text-foreground truncate">Painel Administrativo</span>
          </header>
          <main className="flex-1 overflow-auto bg-background p-3 md:p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AdminLayout;
