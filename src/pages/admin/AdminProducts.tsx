import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";

interface Product {
  id: string;
  name: string;
  description: string | null;
  old_price: number | null;
  new_price: number;
  image_url: string | null;
  category_id: string | null;
  is_best_seller: boolean;
  stock: number;
  active: boolean;
  sort_order: number;
}

interface Category { id: string; name: string; icon: string; }

const AdminProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState({
    name: "", description: "", old_price: "", new_price: "", image_url: "",
    category_id: "", is_best_seller: false, stock: 99, sort_order: 0,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => { load(); loadCategories(); }, []);

  const load = async () => {
    const { data } = await supabase.from("products").select("*").order("sort_order");
    setProducts(data || []);
  };

  const loadCategories = async () => {
    const { data } = await supabase.from("categories").select("id, name, icon").eq("active", true).order("sort_order");
    setCategories(data || []);
  };

  const uploadImage = async (file: File) => {
    const ext = file.name.split(".").pop();
    const path = `products/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("images").upload(path, file);
    if (error) { toast.error("Erro ao enviar imagem"); return null; }
    const { data } = supabase.storage.from("images").getPublicUrl(path);
    return data.publicUrl;
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.new_price) { toast.error("Nome e preço são obrigatórios"); return; }
    
    let image_url = form.image_url;
    if (imageFile) {
      const url = await uploadImage(imageFile);
      if (url) image_url = url;
    }

    const payload = {
      name: form.name,
      description: form.description || null,
      old_price: form.old_price ? parseFloat(form.old_price) : null,
      new_price: parseFloat(form.new_price),
      image_url: image_url || null,
      category_id: form.category_id || null,
      is_best_seller: form.is_best_seller,
      stock: form.stock,
      sort_order: form.sort_order,
    };

    if (editing) {
      const { error } = await supabase.from("products").update(payload).eq("id", editing.id);
      if (error) { toast.error(error.message); return; }
      toast.success("Produto atualizado");
    } else {
      const { error } = await supabase.from("products").insert(payload);
      if (error) { toast.error(error.message); return; }
      toast.success("Produto criado");
    }
    resetForm();
    load();
  };

  const resetForm = () => {
    setOpen(false);
    setEditing(null);
    setImageFile(null);
    setForm({ name: "", description: "", old_price: "", new_price: "", image_url: "", category_id: "", is_best_seller: false, stock: 99, sort_order: 0 });
  };

  const handleEdit = (p: Product) => {
    setEditing(p);
    setForm({
      name: p.name,
      description: p.description || "",
      old_price: p.old_price?.toString() || "",
      new_price: p.new_price.toString(),
      image_url: p.image_url || "",
      category_id: p.category_id || "",
      is_best_seller: p.is_best_seller,
      stock: p.stock,
      sort_order: p.sort_order,
    });
    setOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza?")) return;
    await supabase.from("products").delete().eq("id", id);
    toast.success("Produto removido");
    load();
  };

  const toggleActive = async (id: string, active: boolean) => {
    await supabase.from("products").update({ active: !active }).eq("id", id);
    load();
  };

  const getCategoryName = (id: string | null) => {
    const cat = categories.find((c) => c.id === id);
    return cat ? `${cat.icon} ${cat.name}` : "—";
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4 gap-2">
        <h1 className="text-xl md:text-2xl font-bold truncate">Produtos</h1>
        <Dialog open={open} onOpenChange={(o) => { if (!o) resetForm(); else setOpen(true); }}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="w-4 h-4 mr-1" /> <span className="hidden sm:inline">Novo Produto</span><span className="sm:hidden">Novo</span></Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto max-w-[95vw] sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>{editing ? "Editar" : "Novo"} Produto</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <Input placeholder="Nome" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <Input placeholder="Descrição" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              <div className="grid grid-cols-2 gap-2">
                <Input placeholder="Preço antigo" type="number" step="0.01" value={form.old_price} onChange={(e) => setForm({ ...form, old_price: e.target.value })} />
                <Input placeholder="Preço novo *" type="number" step="0.01" value={form.new_price} onChange={(e) => setForm({ ...form, new_price: e.target.value })} />
              </div>
              <Select value={form.category_id} onValueChange={(v) => setForm({ ...form, category_id: v })}>
                <SelectTrigger><SelectValue placeholder="Categoria" /></SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.icon} {c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div>
                <label className="text-sm font-medium">Imagem</label>
                <Input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)} />
                {form.image_url && !imageFile && (
                  <img src={form.image_url} alt="Preview" className="w-20 h-20 object-cover rounded mt-2" />
                )}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Input type="number" placeholder="Estoque" value={form.stock} onChange={(e) => setForm({ ...form, stock: parseInt(e.target.value) || 0 })} />
                <Input type="number" placeholder="Ordem" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })} />
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={form.is_best_seller} onCheckedChange={(v) => setForm({ ...form, is_best_seller: v })} />
                <span className="text-sm">Mais vendido</span>
              </div>
              <Button onClick={handleSave} className="w-full">{editing ? "Salvar" : "Criar"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Mobile: cards. Desktop: table */}
      <div className="block md:hidden space-y-3">
        {products.map((p) => (
          <Card key={p.id}>
            <CardContent className="p-3 flex gap-3">
              <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted shrink-0">
                {p.image_url ? <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-2xl">🥩</div>}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{getCategoryName(p.category_id)}</p>
                  </div>
                  <Switch checked={p.active} onCheckedChange={() => toggleActive(p.id, p.active)} />
                </div>
                <div className="flex items-center justify-between mt-1">
                  <div>
                    {p.old_price && <span className="text-xs text-muted-foreground line-through mr-1">R$ {Number(p.old_price).toFixed(2)}</span>}
                    <span className="text-sm font-bold text-success">R$ {Number(p.new_price).toFixed(2)}</span>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(p)}><Pencil className="w-3.5 h-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDelete(p.id)}><Trash2 className="w-3.5 h-3.5 text-destructive" /></Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {products.length === 0 && <p className="text-center text-muted-foreground text-sm py-8">Nenhum produto cadastrado</p>}
      </div>

      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left p-2">Imagem</th>
              <th className="text-left p-2">Nome</th>
              <th className="text-left p-2">Categoria</th>
              <th className="text-left p-2">Preço</th>
              <th className="text-left p-2">Ativo</th>
              <th className="text-left p-2">Ações</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b">
                <td className="p-2">
                  {p.image_url ? <img src={p.image_url} alt={p.name} className="w-12 h-12 object-cover rounded" /> : "—"}
                </td>
                <td className="p-2 font-medium">{p.name}</td>
                <td className="p-2">{getCategoryName(p.category_id)}</td>
                <td className="p-2">
                  {p.old_price && <span className="text-muted-foreground line-through mr-1">R$ {Number(p.old_price).toFixed(2)}</span>}
                  <span className="text-success font-bold">R$ {Number(p.new_price).toFixed(2)}</span>
                </td>
                <td className="p-2"><Switch checked={p.active} onCheckedChange={() => toggleActive(p.id, p.active)} /></td>
                <td className="p-2">
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(p)}><Pencil className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(p.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
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

export default AdminProducts;
