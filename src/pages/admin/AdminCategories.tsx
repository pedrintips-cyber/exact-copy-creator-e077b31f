import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";

interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  sort_order: number;
  active: boolean;
}

const AdminCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState({ name: "", slug: "", icon: "📦", sort_order: 0 });

  useEffect(() => { load(); }, []);

  const load = async () => {
    const { data } = await supabase.from("categories").select("*").order("sort_order");
    setCategories(data || []);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error("Nome é obrigatório"); return; }
    const slug = form.slug || form.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    
    if (editing) {
      const { error } = await supabase.from("categories").update({ ...form, slug }).eq("id", editing.id);
      if (error) { toast.error(error.message); return; }
      toast.success("Categoria atualizada");
    } else {
      const { error } = await supabase.from("categories").insert({ ...form, slug });
      if (error) { toast.error(error.message); return; }
      toast.success("Categoria criada");
    }
    setOpen(false);
    setEditing(null);
    setForm({ name: "", slug: "", icon: "📦", sort_order: 0 });
    load();
  };

  const handleEdit = (cat: Category) => {
    setEditing(cat);
    setForm({ name: cat.name, slug: cat.slug, icon: cat.icon, sort_order: cat.sort_order });
    setOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza?")) return;
    await supabase.from("categories").delete().eq("id", id);
    toast.success("Categoria removida");
    load();
  };

  const toggleActive = async (id: string, active: boolean) => {
    await supabase.from("categories").update({ active: !active }).eq("id", id);
    load();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4 gap-2">
        <h1 className="text-xl md:text-2xl font-bold truncate">Categorias</h1>
        <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) { setEditing(null); setForm({ name: "", slug: "", icon: "📦", sort_order: 0 }); }}}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="w-4 h-4 mr-1" /> <span className="hidden sm:inline">Nova Categoria</span><span className="sm:hidden">Nova</span></Button>
          </DialogTrigger>
          <DialogContent className="max-w-[95vw] sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>{editing ? "Editar" : "Nova"} Categoria</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <Input placeholder="Nome" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <Input placeholder="Slug (auto)" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
              <Input placeholder="Ícone (emoji)" value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} />
              <Input type="number" placeholder="Ordem" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })} />
              <Button onClick={handleSave} className="w-full">{editing ? "Salvar" : "Criar"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Mobile cards */}
      <div className="block md:hidden space-y-2">
        {categories.map((cat) => (
          <Card key={cat.id}>
            <CardContent className="p-3 flex items-center gap-3">
              <span className="text-2xl">{cat.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">{cat.name}</p>
                <p className="text-xs text-muted-foreground">{cat.slug}</p>
              </div>
              <Switch checked={cat.active} onCheckedChange={() => toggleActive(cat.id, cat.active)} />
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(cat)}><Pencil className="w-3.5 h-3.5" /></Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDelete(cat.id)}><Trash2 className="w-3.5 h-3.5 text-destructive" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {categories.length === 0 && <p className="text-center text-muted-foreground text-sm py-8">Nenhuma categoria</p>}
      </div>

      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left p-2">Ícone</th>
              <th className="text-left p-2">Nome</th>
              <th className="text-left p-2">Slug</th>
              <th className="text-left p-2">Ordem</th>
              <th className="text-left p-2">Ativa</th>
              <th className="text-left p-2">Ações</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat) => (
              <tr key={cat.id} className="border-b">
                <td className="p-2">{cat.icon}</td>
                <td className="p-2 font-medium">{cat.name}</td>
                <td className="p-2 text-muted-foreground">{cat.slug}</td>
                <td className="p-2">{cat.sort_order}</td>
                <td className="p-2"><Switch checked={cat.active} onCheckedChange={() => toggleActive(cat.id, cat.active)} /></td>
                <td className="p-2">
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(cat)}><Pencil className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(cat.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminCategories;
