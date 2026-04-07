import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil, Trash2, Star } from "lucide-react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";

interface Review {
  id: string;
  customer_name: string;
  text: string;
  rating: number;
  active: boolean;
}

const AdminReviews = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Review | null>(null);
  const [form, setForm] = useState({ customer_name: "", text: "", rating: "5.0" });

  useEffect(() => { load(); }, []);

  const load = async () => {
    const { data } = await supabase.from("reviews").select("*").order("created_at", { ascending: false });
    setReviews(data || []);
  };

  const handleSave = async () => {
    if (!form.customer_name.trim() || !form.text.trim()) { toast.error("Preencha todos os campos"); return; }
    const payload = { customer_name: form.customer_name, text: form.text, rating: parseFloat(form.rating) };

    if (editing) {
      await supabase.from("reviews").update(payload).eq("id", editing.id);
      toast.success("Avaliação atualizada");
    } else {
      await supabase.from("reviews").insert(payload);
      toast.success("Avaliação criada");
    }
    resetForm();
    load();
  };

  const resetForm = () => {
    setOpen(false); setEditing(null);
    setForm({ customer_name: "", text: "", rating: "5.0" });
  };

  const handleEdit = (r: Review) => {
    setEditing(r);
    setForm({ customer_name: r.customer_name, text: r.text, rating: r.rating.toString() });
    setOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza?")) return;
    await supabase.from("reviews").delete().eq("id", id);
    toast.success("Avaliação removida");
    load();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Avaliações</h1>
        <Dialog open={open} onOpenChange={(o) => { if (!o) resetForm(); else setOpen(true); }}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2" /> Nova Avaliação</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editing ? "Editar" : "Nova"} Avaliação</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <Input placeholder="Nome do cliente" value={form.customer_name} onChange={(e) => setForm({ ...form, customer_name: e.target.value })} />
              <Textarea placeholder="Texto da avaliação" value={form.text} onChange={(e) => setForm({ ...form, text: e.target.value })} />
              <Input type="number" step="0.1" min="1" max="5" placeholder="Nota" value={form.rating} onChange={(e) => setForm({ ...form, rating: e.target.value })} />
              <Button onClick={handleSave} className="w-full">{editing ? "Salvar" : "Criar"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Nota</TableHead>
            <TableHead>Texto</TableHead>
            <TableHead>Ativa</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reviews.map((r) => (
            <TableRow key={r.id}>
              <TableCell className="font-medium">{r.customer_name}</TableCell>
              <TableCell><div className="flex items-center gap-1"><Star className="w-3 h-3 fill-warning text-warning" />{r.rating}</div></TableCell>
              <TableCell className="max-w-xs truncate">{r.text}</TableCell>
              <TableCell>
                <Switch checked={r.active} onCheckedChange={async () => {
                  await supabase.from("reviews").update({ active: !r.active }).eq("id", r.id);
                  load();
                }} />
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(r)}><Pencil className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(r.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default AdminReviews;
