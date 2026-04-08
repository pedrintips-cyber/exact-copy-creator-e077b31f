import {
  LayoutDashboard,
  Package,
  FolderOpen,
  Image,
  Star,
  ShoppingCart,
  Users,
  Settings,
  LogOut,
  Pizza,
  UtensilsCrossed,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const menuItems = [
  { title: "Dashboard", url: "/admin", icon: LayoutDashboard },
  { title: "Categorias", url: "/admin/categorias", icon: FolderOpen },
  { title: "Produtos", url: "/admin/produtos", icon: Package },
  { title: "Banners", url: "/admin/banners", icon: Image },
  { title: "Avaliações", url: "/admin/avaliacoes", icon: Star },
  { title: "Pedidos", url: "/admin/pedidos", icon: ShoppingCart },
  { title: "Clientes", url: "/admin/clientes", icon: Users },
];

const comboItems = [
  { title: "Categorias do Combo", url: "/admin/kit-categorias", icon: UtensilsCrossed },
  { title: "Itens do Combo", url: "/admin/kit-itens", icon: Pizza },
];

const configItems = [
  { title: "Configurações", url: "/admin/configuracoes", icon: Settings },
];

export function AdminSidebar() {
  const { state, isMobile } = useSidebar();
  const collapsed = state === "collapsed" && !isMobile;
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate("/admin/login");
  };

  const navItemClassName =
    "text-sidebar-foreground [&_*]:text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:[&_*]:text-sidebar-accent-foreground";
  const activeClassName =
    "bg-sidebar-accent text-sidebar-accent-foreground [&_*]:text-sidebar-accent-foreground font-medium";

  return (
    <Sidebar
      collapsible="icon"
      className="border-sidebar-border bg-sidebar text-sidebar-foreground [&_a]:text-sidebar-foreground [&_button]:text-sidebar-foreground [&_span]:text-sidebar-foreground [&_svg]:text-sidebar-foreground"
    >
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/70">
            {!collapsed && "🍕 Pizza House"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className={navItemClassName}>
                    <NavLink
                      to={item.url}
                      end={item.url === "/admin"}
                      className={navItemClassName}
                      activeClassName={activeClassName}
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/70">
            {!collapsed && "Combos"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {comboItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className={navItemClassName}>
                    <NavLink to={item.url} className={navItemClassName} activeClassName={activeClassName}>
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/70">{!collapsed && "Sistema"}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {configItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className={navItemClassName}>
                    <NavLink to={item.url} className={navItemClassName} activeClassName={activeClassName}>
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              <SidebarMenuItem>
                <SidebarMenuButton onClick={handleLogout} className="cursor-pointer text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
                  <LogOut className="mr-2 h-4 w-4" />
                  {!collapsed && <span>Sair</span>}
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
