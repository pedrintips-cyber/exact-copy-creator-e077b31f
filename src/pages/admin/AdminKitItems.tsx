import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";

interface KitItem {
  id: string;
  name: string;
  description: string | null;
  price_per_unit: number;
  unit: string;
  image_url: string | null;
  kit_category_id: string | null;
  min_quantity: number;
  max_quantity: number;
  step: number;
  active: boolean;
  sort_order: number;
}

interface KitCategory { id: string; name: string; icon: string; }

const AdminKitItems = () => {
  const [items, setItems] = useState<KitItem[]>([]);
  const [categories, setCategories] = useState<KitCategory[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<KitItem | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [form, setForm] = useState({
    name: "", description: "", price_per_unit: "", unit: "kg",
    image_url: "", kit_category_id: "", min_quantity: "0.5",
    max_quantity: "10", step: "0.5", sort_order: 0,
  });

  useEffect(() => { load(); loadCategories(); }, []);

  const load = async () => {
    const { data } = await supabase.from("kit_items").select("*").order("sort_order");
    setItems(data || []);
  };

  const loadCategories = async () => {
    const { data } = await supabase.from("kit_categories").select("id, name, icon").eq("active", true).order("sort_order");
    setCategories(data || []);
  };

  const uploadImage = async (file: File) => {
    const ext = file.name.split(".").pop();
    const path = `kit/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("images").upload(path, file);
    if (error) { toast.error("Erro ao enviar imagem"); return null; }
    return supabase.storage.from("images").getPublicUrl(path).data.publicUrl;
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.price_per_unit) { toast.error("Nome e preço são obrigatórios"); return; }

    let image_url = form.image_url;
    if (imageFile) { const url = await uploadImage(imageFile); if (url) image_url = url; }

    const payload = {
      name: form.name, description: form.description || null,
      price_per_unit: parseFloat(form.price_per_unit), unit: form.unit,
      image_url: image_url || null, kit_category_id: form.kit_category_id || null,
      min_quantity: parseFloat(form.min_quantity), max_quantity: parseFloat(form.max_quantity),
      step: parseFloat(form.step), sort_order: form.sort_order,
    };

    if (editing) {
      await supabase.from("kit_items").update(payload).eq("id", editing.id);
      toast.success("Item atualizado");
    } else {
      await supabase.from("kit_items").insert(payload);
      toast.success("Item criado");
    }
    resetForm(); load();
  };

  const resetForm = () => {
    setOpen(false); setEditing(null); setImageFile(null);
    setForm({ name: "", description: "", price_per_unit: "", unit: "kg", image_url: "", kit_category_id: "", min_quantity: "0.5", max_quantity: "10", step: "0.5", sort_order: 0 });
  };

  const handleEdit = (item: KitItem) => {
    setEditing(item);
    setForm({
      name: item.name, description: item.description || "",
      price_per_unit: item.price_per_unit.toString(), unit: item.unit,
      image_url: item.image_url || "", kit_category_id: item.kit_category_id || "",
      min_quantity: item.min_quantity.toString(), max_quantity: item.max_quantity.toString(),
      step: item.step.toString(), sort_order: item.sort_order,
    });
    setOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza?")) return;
    await supabase.from("kit_items").delete().eq("id", id);
    toast.success("Item removido"); load();
  };

  const getCatName = (id: string | null) => {
    const c = categories.find((x) => x.id === id);
    return c ? `${c.icon} ${c.name}` : "—";
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Itens do Kit</h1>
        <Dialog open={open} onOpenChange={(o) => { if (!o) resetForm(); else setOpen(true); }}>
          <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" /> Novo Item</Button></DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editing ? "Editar" : "Novo"} Item do Kit</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <Input placeholder="Nome (ex: Picanha)" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <Input placeholder="Descrição" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              <div className="grid grid-cols-2 gap-2">
                <Input placeholder="Preço por unidade *" type="number" step="0.01" value={form.price_per_unit} onChange={(e) => setForm({ ...form, price_per_unit: e.target.value })} />
                <Select value={form.unit} onValueChange={(v) => setForm({ ...form, unit: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kg">kg</SelectItem>
                    <SelectItem value="un">un</SelectItem>
                    <SelectItem value="pacote">pacote</SelectItem>
                    <SelectItem value="litro">litro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Select value={form.kit_category_id} onValueChange={(v) => setForm({ ...form, kit_category_id: v })}>
                <SelectTrigger><SelectValue placeholder="Categoria do Kit" /></SelectTrigger>
                <SelectContent>
                  {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.icon} {c.name}</SelectItem>)}
                </SelectContent>
              </Select>
              <div>
                <label className="text-sm font-medium">Imagem</label>
                <Input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)} />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <Input placeholder="Qtd mín" type="number" step="0.1" value={form.min_quantity} onChange={(e) => setForm({ ...form, min_quantity: e.target.value })} />
                <Input placeholder="Qtd máx" type="number" step="0.1" value={form.max_quantity} onChange={(e) => setForm({ ...form, max_quantity: e.target.value })} />
                <Input placeholder="Step" type="number" step="0.1" value={form.step} onChange={(e) => setForm({ ...form, step: e.target.value })} />
              </div>
              <Button onClick={handleSave} className="w-full">{editing ? "Salvar" : "Criar"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead><TableHead>Categoria</TableHead>
              <TableHead>Preço</TableHead><TableHead>Unidade</TableHead>
              <TableHead>Ativo</TableHead><TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell>{getCatName(item.kit_category_id)}</TableCell>
                <TableCell className="font-bold text-success">R$ {Number(item.price_per_unit).toFixed(2)}</TableCell>
                <TableCell>{item.unit}</TableCell>
                <TableCell>
                  <Switch checked={item.active} onCheckedChange={async () => {
                    await supabase.from("kit_items").update({ active: !item.active }).eq("id", item.id);
                    load();
                  }} />
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}><Pencil className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default AdminKitItems;
