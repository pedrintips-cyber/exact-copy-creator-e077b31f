import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";

interface KitCategory {
  id: string;
  name: string;
  slug: string;
  icon: string;
  sort_order: number;
  active: boolean;
}

const AdminKitCategories = () => {
  const [items, setItems] = useState<KitCategory[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<KitCategory | null>(null);
  const [form, setForm] = useState({ name: "", slug: "", icon: "🥩", sort_order: 0 });

  useEffect(() => { load(); }, []);

  const load = async () => {
    const { data } = await supabase.from("kit_categories").select("*").order("sort_order");
    setItems(data || []);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error("Nome é obrigatório"); return; }
    const slug = form.slug || form.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

    if (editing) {
      await supabase.from("kit_categories").update({ ...form, slug }).eq("id", editing.id);
      toast.success("Atualizada");
    } else {
      await supabase.from("kit_categories").insert({ ...form, slug });
      toast.success("Criada");
    }
    resetForm(); load();
  };

  const resetForm = () => { setOpen(false); setEditing(null); setForm({ name: "", slug: "", icon: "🥩", sort_order: 0 }); };

  const handleEdit = (c: KitCategory) => {
    setEditing(c); setForm({ name: c.name, slug: c.slug, icon: c.icon, sort_order: c.sort_order }); setOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza?")) return;
    await supabase.from("kit_categories").delete().eq("id", id);
    toast.success("Removida"); load();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Categorias do Kit</h1>
        <Dialog open={open} onOpenChange={(o) => { if (!o) resetForm(); else setOpen(true); }}>
          <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" /> Nova</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editing ? "Editar" : "Nova"} Categoria do Kit</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <Input placeholder="Nome (ex: Carnes)" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <Input placeholder="Slug (auto)" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
              <Input placeholder="Ícone (emoji)" value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} />
              <Input type="number" placeholder="Ordem" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })} />
              <Button onClick={handleSave} className="w-full">{editing ? "Salvar" : "Criar"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Ícone</TableHead><TableHead>Nome</TableHead><TableHead>Slug</TableHead>
            <TableHead>Ativa</TableHead><TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((c) => (
            <TableRow key={c.id}>
              <TableCell>{c.icon}</TableCell>
              <TableCell className="font-medium">{c.name}</TableCell>
              <TableCell className="text-muted-foreground">{c.slug}</TableCell>
              <TableCell>
                <Switch checked={c.active} onCheckedChange={async () => {
                  await supabase.from("kit_categories").update({ active: !c.active }).eq("id", c.id);
                  load();
                }} />
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(c)}><Pencil className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(c.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default AdminKitCategories;
