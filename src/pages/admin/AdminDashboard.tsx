import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingCart, DollarSign, Users, Eye, Package, TrendingUp } from "lucide-react";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    paidOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
    totalVisits: 0,
    recentOrders: [] as any[],
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    const [orders, products, visits] = await Promise.all([
      supabase.from("orders").select("*"),
      supabase.from("products").select("id", { count: "exact" }),
      supabase.from("site_visits").select("id", { count: "exact" }),
    ]);

    const allOrders = orders.data || [];
    const paid = allOrders.filter((o) => o.status === "paid" || o.status === "delivered");
    const pending = allOrders.filter((o) => o.status === "pending");
    const revenue = paid.reduce((sum, o) => sum + Number(o.total), 0);

    setStats({
      totalOrders: allOrders.length,
      pendingOrders: pending.length,
      paidOrders: paid.length,
      totalRevenue: revenue,
      totalProducts: products.count || 0,
      totalVisits: visits.count || 0,
      recentOrders: allOrders.slice(0, 10),
    });
  };

  const cards = [
    { title: "Pedidos", value: stats.totalOrders, icon: ShoppingCart, color: "text-primary" },
    { title: "Pendentes", value: stats.pendingOrders, icon: ShoppingCart, color: "text-warning" },
    { title: "Pagos", value: stats.paidOrders, icon: DollarSign, color: "text-success" },
    { title: "Receita", value: `R$ ${stats.totalRevenue.toFixed(2)}`, icon: TrendingUp, color: "text-success" },
    { title: "Produtos", value: stats.totalProducts, icon: Package, color: "text-primary" },
    { title: "Visitas", value: stats.totalVisits, icon: Eye, color: "text-muted-foreground" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {cards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="pb-2 p-4">
              <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                <card.icon className={`w-3.5 h-3.5 ${card.color}`} />
                {card.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <p className="text-xl font-bold">{card.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Últimos Pedidos</CardTitle>
        </CardHeader>
        <CardContent>
          {stats.recentOrders.length === 0 ? (
            <p className="text-muted-foreground text-sm">Nenhum pedido ainda</p>
          ) : (
            <div className="space-y-2">
              {stats.recentOrders.map((order) => (
                <div key={order.id} className="flex justify-between items-center border-b pb-2">
                  <div>
                    <p className="font-medium text-sm">{order.customer_name}</p>
                    <p className="text-xs text-muted-foreground">{order.customer_phone}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm">R$ {Number(order.total).toFixed(2)}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      order.status === "paid" || order.status === "delivered"
                        ? "bg-success/10 text-success"
                        : order.status === "cancelled"
                        ? "bg-destructive/10 text-destructive"
                        : "bg-warning/10 text-warning"
                    }`}>
                      {order.status === "pending" ? "Pendente" :
                       order.status === "paid" ? "Pago" :
                       order.status === "delivered" ? "Entregue" :
                       order.status === "preparing" ? "Preparando" :
                       order.status === "delivering" ? "Entregando" : "Cancelado"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
