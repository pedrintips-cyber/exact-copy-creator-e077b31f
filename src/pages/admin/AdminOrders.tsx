import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";

interface Order {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string | null;
  customer_cpf: string | null;
  items: any;
  total: number;
  status: string;
  payment_method: string | null;
  created_at: string;
}

const statusLabels: Record<string, string> = {
  pending: "Pendente", paid: "Pago", preparing: "Preparando",
  delivering: "Entregando", delivered: "Entregue", cancelled: "Cancelado",
};
const statusColors: Record<string, string> = {
  pending: "bg-warning/10 text-warning", paid: "bg-success/10 text-success",
  preparing: "bg-primary/10 text-primary", delivering: "bg-primary/10 text-primary",
  delivered: "bg-success/10 text-success", cancelled: "bg-destructive/10 text-destructive",
};

const AdminOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selected, setSelected] = useState<Order | null>(null);
  const [filter, setFilter] = useState("all");

  useEffect(() => { load(); }, []);

  const load = async () => {
    const { data } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
    setOrders(data || []);
  };

  const updateStatus = async (id: string, status: string) => {
    await supabase.from("orders").update({ status }).eq("id", id);
    load();
  };

  const filtered = filter === "all" ? orders : orders.filter((o) => o.status === filter);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Pedidos ({filtered.length})</h1>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {Object.entries(statusLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Data</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((o) => (
            <TableRow key={o.id}>
              <TableCell className="text-sm">{new Date(o.created_at).toLocaleDateString("pt-BR")}</TableCell>
              <TableCell>
                <p className="font-medium text-sm">{o.customer_name}</p>
                <p className="text-xs text-muted-foreground">{o.customer_phone}</p>
              </TableCell>
              <TableCell className="font-bold">R$ {Number(o.total).toFixed(2)}</TableCell>
              <TableCell>
                <Select value={o.status} onValueChange={(v) => updateStatus(o.id, v)}>
                  <SelectTrigger className="w-32 h-8">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[o.status]}`}>
                      {statusLabels[o.status]}
                    </span>
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(statusLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell>
                <Button variant="ghost" size="icon" onClick={() => setSelected(o)}><Eye className="w-4 h-4" /></Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Detalhes do Pedido</DialogTitle></DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><strong>Cliente:</strong> {selected.customer_name}</div>
                <div><strong>Telefone:</strong> {selected.customer_phone}</div>
                <div><strong>CPF:</strong> {selected.customer_cpf || "—"}</div>
                <div><strong>Endereço:</strong> {selected.customer_address || "—"}</div>
                <div><strong>Pagamento:</strong> {selected.payment_method || "—"}</div>
                <div><strong>Total:</strong> R$ {Number(selected.total).toFixed(2)}</div>
              </div>
              <div>
                <strong className="text-sm">Itens:</strong>
                <pre className="bg-muted p-2 rounded text-xs mt-1 overflow-auto">
                  {JSON.stringify(selected.items, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminOrders;
