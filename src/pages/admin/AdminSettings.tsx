import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Save, Upload, Image } from "lucide-react";

const settingsKeys = [
  { key: "store_name", label: "Nome da Loja", placeholder: "Pizza House" },
  { key: "store_phone", label: "Telefone/WhatsApp", placeholder: "(11) 99999-9999" },
  { key: "store_address", label: "Endereço", placeholder: "Rua..." },
  { key: "facebook_pixel", label: "Pixel do Facebook (ID)", placeholder: "123456789" },
  { key: "google_analytics", label: "Google Analytics (ID)", placeholder: "G-XXXXXXXXXX" },
  { key: "payment_gateway_token", label: "Token Gateway de Pagamento", placeholder: "Token..." },
  { key: "delivery_fee", label: "Taxa de Entrega (R$)", placeholder: "0.00" },
  { key: "min_order_value", label: "Pedido Mínimo (R$)", placeholder: "20.00" },
  { key: "whatsapp_number", label: "WhatsApp para Pedidos", placeholder: "5511999999999" },
  { key: "instagram_url", label: "Instagram", placeholder: "https://instagram.com/..." },
  { key: "opening_hours", label: "Horário de Funcionamento", placeholder: "Seg-Sex 10h-22h" },
];

const categoryBannerKeys = [
  { key: "banner_promocoes", label: "Banner Promoções", description: "Imagem que aparece na homepage para a seção de promoções" },
  { key: "banner_pizzas", label: "Banner Pizzas", description: "Imagem que aparece na homepage para a seção de pizzas" },
  { key: "banner_bebidas", label: "Banner Bebidas", description: "Imagem que aparece na homepage para a seção de bebidas" },
];

const AdminSettings = () => {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState<string | null>(null);

  useEffect(() => { load(); }, []);

  const load = async () => {
    const { data } = await supabase.from("site_settings").select("*");
    const map: Record<string, string> = {};
    data?.forEach((s) => { map[s.key] = s.value || ""; });
    setSettings(map);
  };

  const uploadImage = async (file: File, folder: string) => {
    const ext = file.name.split(".").pop();
    const path = `${folder}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("images").upload(path, file);
    if (error) { toast.error("Erro ao enviar imagem"); return null; }
    const { data } = supabase.storage.from("images").getPublicUrl(path);
    return data.publicUrl;
  };

  const upsertSetting = async (key: string, value: string) => {
    const { data: existing } = await supabase.from("site_settings").select("id").eq("key", key).maybeSingle();
    if (existing) {
      await supabase.from("site_settings").update({ value }).eq("id", existing.id);
    } else {
      await supabase.from("site_settings").insert({ key, value });
    }
  };

  const handleLogoUpload = async (file: File) => {
    setUploadingLogo(true);
    const url = await uploadImage(file, "logos");
    if (url) {
      await upsertSetting("store_logo", url);
      setSettings((s) => ({ ...s, store_logo: url }));
    }
    setUploadingLogo(false);
  };

  const handleBannerUpload = async (key: string, file: File) => {
    setUploadingBanner(key);
    const url = await uploadImage(file, "category-banners");
    if (url) {
      await upsertSetting(key, url);
      setSettings((s) => ({ ...s, [key]: url }));
      toast.success("Banner atualizado!");
    }
    setUploadingBanner(null);
  };

  const handleSave = async () => {
    setSaving(true);
    for (const { key } of settingsKeys) {
      await upsertSetting(key, settings[key] || "");
    }
    setSaving(false);
    toast.success("Configurações salvas!");
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Configurações</h1>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="w-4 h-4 mr-2" /> {saving ? "Salvando..." : "Salvar Tudo"}
        </Button>
      </div>

      <div className="grid gap-4">
        {/* Banners de Categoria */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Image className="w-5 h-5" /> Banners da Homepage
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Faça upload das imagens que aparecerão como banners clicáveis na página inicial.
            </p>
            {categoryBannerKeys.map(({ key, label, description }) => (
              <div key={key} className="border border-border rounded-xl p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold">{label}</p>
                    <p className="text-xs text-muted-foreground">{description}</p>
                  </div>
                  <label className="cursor-pointer">
                    <Button variant="outline" size="sm" asChild disabled={uploadingBanner === key}>
                      <span>
                        <Upload className="w-3.5 h-3.5 mr-1.5" />
                        {uploadingBanner === key ? "Enviando..." : "Upload"}
                      </span>
                    </Button>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) handleBannerUpload(key, f);
                      }}
                    />
                  </label>
                </div>
                {settings[key] ? (
                  <img src={settings[key]} alt={label} className="w-full h-28 object-cover rounded-lg" />
                ) : (
                  <div className="w-full h-28 bg-muted rounded-lg flex items-center justify-center text-muted-foreground text-sm">
                    Nenhuma imagem
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Logo + Dados */}
        <Card>
          <CardHeader><CardTitle className="text-lg">Dados da Loja</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Logo da Loja</label>
              <div className="flex items-center gap-3 mt-1">
                {settings.store_logo ? (
                  <img src={settings.store_logo} alt="Logo" className="w-16 h-16 rounded-full object-cover border border-border" />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center text-2xl">🍕</div>
                )}
                <label className="cursor-pointer">
                  <Button variant="outline" size="sm" asChild disabled={uploadingLogo}>
                    <span><Upload className="w-3.5 h-3.5 mr-1.5" />{uploadingLogo ? "Enviando..." : "Enviar Logo"}</span>
                  </Button>
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleLogoUpload(f);
                  }} />
                </label>
              </div>
            </div>
            {settingsKeys.slice(0, 3).map(({ key, label, placeholder }) => (
              <div key={key}>
                <label className="text-sm font-medium">{label}</label>
                <Input placeholder={placeholder} value={settings[key] || ""} onChange={(e) => setSettings({ ...settings, [key]: e.target.value })} />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-lg">Integrações</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {settingsKeys.slice(3, 6).map(({ key, label, placeholder }) => (
              <div key={key}>
                <label className="text-sm font-medium">{label}</label>
                <Input placeholder={placeholder} value={settings[key] || ""} onChange={(e) => setSettings({ ...settings, [key]: e.target.value })} />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-lg">Pedidos & Entrega</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {settingsKeys.slice(6).map(({ key, label, placeholder }) => (
              <div key={key}>
                <label className="text-sm font-medium">{label}</label>
                <Input placeholder={placeholder} value={settings[key] || ""} onChange={(e) => setSettings({ ...settings, [key]: e.target.value })} />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminSettings;
