import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";

interface Banner {
  id: string;
  title: string | null;
  image_url: string;
  active: boolean;
  sort_order: number;
}

const AdminBanners = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Banner | null>(null);
  const [form, setForm] = useState({ title: "", sort_order: 0 });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [existingUrl, setExistingUrl] = useState("");

  useEffect(() => { load(); }, []);

  const load = async () => {
    const { data } = await supabase.from("banners").select("*").order("sort_order");
    setBanners(data || []);
  };

  const uploadImage = async (file: File) => {
    const ext = file.name.split(".").pop();
    const path = `banners/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("images").upload(path, file);
    if (error) { toast.error("Erro ao enviar imagem"); return null; }
    const { data } = supabase.storage.from("images").getPublicUrl(path);
    return data.publicUrl;
  };

  const handleSave = async () => {
    let image_url = existingUrl;
    if (imageFile) {
      const url = await uploadImage(imageFile);
      if (!url) return;
      image_url = url;
    }
    if (!image_url) { toast.error("Imagem é obrigatória"); return; }

    if (editing) {
      await supabase.from("banners").update({ title: form.title || null, image_url, sort_order: form.sort_order }).eq("id", editing.id);
      toast.success("Banner atualizado");
    } else {
      await supabase.from("banners").insert({ title: form.title || null, image_url, sort_order: form.sort_order });
      toast.success("Banner criado");
    }
    resetForm();
    load();
  };

  const resetForm = () => {
    setOpen(false); setEditing(null); setImageFile(null); setExistingUrl("");
    setForm({ title: "", sort_order: 0 });
  };

  const handleEdit = (b: Banner) => {
    setEditing(b);
    setForm({ title: b.title || "", sort_order: b.sort_order });
    setExistingUrl(b.image_url);
    setOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza?")) return;
    await supabase.from("banners").delete().eq("id", id);
    toast.success("Banner removido");
    load();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Banners</h1>
        <Dialog open={open} onOpenChange={(o) => { if (!o) resetForm(); else setOpen(true); }}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2" /> Novo Banner</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editing ? "Editar" : "Novo"} Banner</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <Input placeholder="Título (opcional)" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              <Input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)} />
              {existingUrl && !imageFile && <img src={existingUrl} alt="Preview" className="w-full h-32 object-cover rounded" />}
              <Input type="number" placeholder="Ordem" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })} />
              <Button onClick={handleSave} className="w-full">{editing ? "Salvar" : "Criar"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {banners.map((b) => (
          <div key={b.id} className="border rounded-lg overflow-hidden">
            <img src={b.image_url} alt={b.title || "Banner"} className="w-full h-40 object-cover" />
            <div className="p-3 flex justify-between items-center">
              <div>
                <p className="font-medium text-sm">{b.title || "Sem título"}</p>
                <Switch checked={b.active} onCheckedChange={async () => {
                  await supabase.from("banners").update({ active: !b.active }).eq("id", b.id);
                  load();
                }} />
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" onClick={() => handleEdit(b)}><Pencil className="w-4 h-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(b.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminBanners;
