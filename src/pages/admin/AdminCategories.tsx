import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Upload } from "lucide-react";
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
  banner_image_url: string | null;
}

const emptyForm = {
  name: "",
  slug: "",
  icon: "📦",
  sort_order: 0,
  banner_image_url: "",
};

const AdminCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => { load(); }, []);

  const load = async () => {
    const { data } = await supabase.from("categories").select("*").order("sort_order");
    setCategories((data as Category[]) || []);
  };

  const resetForm = () => {
    setOpen(false);
    setEditing(null);
    setImageFile(null);
    setForm(emptyForm);
    setSaving(false);
  };

  const uploadImage = async (file: File) => {
    const ext = file.name.split(".").pop();
    const path = `categories/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("images").upload(path, file);
    if (error) {
      toast.error("Erro ao enviar banner");
      return null;
    }
    const { data } = supabase.storage.from("images").getPublicUrl(path);
    return data.publicUrl;
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error("Nome é obrigatório");
      return;
    }

    setSaving(true);
    const slug = form.slug || form.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

    let bannerImageUrl = form.banner_image_url;
    if (imageFile) {
      const url = await uploadImage(imageFile);
      if (!url) {
        setSaving(false);
        return;
      }
      bannerImageUrl = url;
    }

    const payload = {
      name: form.name,
      slug,
      icon: form.icon,
      sort_order: form.sort_order,
      banner_image_url: bannerImageUrl || null,
    } as any;

    if (editing) {
      const { error } = await supabase.from("categories").update(payload).eq("id", editing.id);
      if (error) {
        toast.error(error.message);
        setSaving(false);
        return;
      }
      toast.success("Categoria atualizada");
    } else {
      const { error } = await supabase.from("categories").insert(payload);
      if (error) {
        toast.error(error.message);
        setSaving(false);
        return;
      }
      toast.success("Categoria criada");
    }

    resetForm();
    load();
  };

  const handleEdit = (cat: Category) => {
    setEditing(cat);
    setImageFile(null);
    setForm({
      name: cat.name,
      slug: cat.slug,
      icon: cat.icon,
      sort_order: cat.sort_order,
      banner_image_url: cat.banner_image_url || "",
    });
    setOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza?")) return;
    await supabase.from("categories").delete().eq("id", id);
    toast.success("Categoria removida");
    load();
  };

  const toggleActive = async (id: string, active: boolean) => {
    await supabase.from("categories").update({ active: !active } as any).eq("id", id);
    load();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4 gap-2">
        <h1 className="text-xl md:text-2xl font-bold truncate">Categorias</h1>
        <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) resetForm(); }}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="w-4 h-4 mr-1" /> <span className="hidden sm:inline">Nova Categoria</span><span className="sm:hidden">Nova</span></Button>
          </DialogTrigger>
          <DialogContent className="max-w-[95vw] sm:max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editing ? "Editar" : "Nova"} Categoria</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <Input placeholder="Nome" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <Input placeholder="Slug (auto)" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
              <Input placeholder="Ícone (emoji)" value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} />
              <Input type="number" placeholder="Ordem" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })} />

              <div className="space-y-2">
                <label className="text-sm font-medium">Banner da categoria</label>
                <label className="cursor-pointer block">
                  <div className="flex h-11 items-center justify-center gap-2 rounded-md border border-input bg-background px-3 text-sm">
                    <Upload className="w-4 h-4" />
                    <span>{imageFile ? imageFile.name : "Selecionar imagem"}</span>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                  />
                </label>
                {(imageFile || form.banner_image_url) && (
                  <img
                    src={imageFile ? URL.createObjectURL(imageFile) : form.banner_image_url}
                    alt="Preview do banner"
                    className="w-full h-32 rounded-xl object-cover border border-border"
                  />
                )}
              </div>

              <Button onClick={handleSave} disabled={saving} className="w-full">
                {saving ? "Salvando..." : editing ? "Salvar" : "Criar"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="block md:hidden space-y-2">
        {categories.map((cat) => (
          <Card key={cat.id}>
            <CardContent className="p-3 flex items-center gap-3">
              {cat.banner_image_url ? (
                <img src={cat.banner_image_url} alt={cat.name} className="w-16 h-16 rounded-xl object-cover shrink-0 border border-border" />
              ) : (
                <div className="w-16 h-16 rounded-xl bg-muted flex items-center justify-center text-2xl shrink-0">{cat.icon}</div>
              )}
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

      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left p-2">Banner</th>
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
                <td className="p-2">
                  {cat.banner_image_url ? (
                    <img src={cat.banner_image_url} alt={cat.name} className="w-20 h-12 rounded object-cover border border-border" />
                  ) : "—"}
                </td>
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
