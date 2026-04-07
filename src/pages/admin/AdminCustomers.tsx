import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface Customer {
  customer_name: string;
  customer_phone: string;
  customer_cpf: string | null;
  total_orders: number;
  total_spent: number;
  last_order: string;
}

const AdminCustomers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);

  useEffect(() => { load(); }, []);

  const load = async () => {
    const { data } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
    if (!data) return;

    const map = new Map<string, Customer>();
    data.forEach((o) => {
      const key = o.customer_phone;
      const existing = map.get(key);
      if (existing) {
        existing.total_orders++;
        existing.total_spent += Number(o.total);
        if (new Date(o.created_at) > new Date(existing.last_order)) {
          existing.last_order = o.created_at;
          existing.customer_name = o.customer_name;
        }
      } else {
        map.set(key, {
          customer_name: o.customer_name,
          customer_phone: o.customer_phone,
          customer_cpf: o.customer_cpf,
          total_orders: 1,
          total_spent: Number(o.total),
          last_order: o.created_at,
        });
      }
    });

    setCustomers(Array.from(map.values()).sort((a, b) => b.total_spent - a.total_spent));
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Clientes ({customers.length})</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Telefone</TableHead>
            <TableHead>CPF</TableHead>
            <TableHead>Pedidos</TableHead>
            <TableHead>Total Gasto</TableHead>
            <TableHead>Último Pedido</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {customers.map((c) => (
            <TableRow key={c.customer_phone}>
              <TableCell className="font-medium">{c.customer_name}</TableCell>
              <TableCell>{c.customer_phone}</TableCell>
              <TableCell>{c.customer_cpf || "—"}</TableCell>
              <TableCell>{c.total_orders}</TableCell>
              <TableCell className="font-bold">R$ {c.total_spent.toFixed(2)}</TableCell>
              <TableCell>{new Date(c.last_order).toLocaleDateString("pt-BR")}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default AdminCustomers;
