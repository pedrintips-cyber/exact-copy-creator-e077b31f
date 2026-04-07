import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Save } from "lucide-react";

const settingsKeys = [
  { key: "store_name", label: "Nome da Loja", placeholder: "Sítio do Churrasco" },
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

const AdminSettings = () => {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => { load(); }, []);

  const load = async () => {
    const { data } = await supabase.from("site_settings").select("*");
    const map: Record<string, string> = {};
    data?.forEach((s) => { map[s.key] = s.value || ""; });
    setSettings(map);
  };

  const handleSave = async () => {
    setSaving(true);
    for (const { key } of settingsKeys) {
      const value = settings[key] || "";
      const { data: existing } = await supabase.from("site_settings").select("id").eq("key", key).maybeSingle();
      if (existing) {
        await supabase.from("site_settings").update({ value }).eq("id", existing.id);
      } else {
        await supabase.from("site_settings").insert({ key, value });
      }
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
        <Card>
          <CardHeader><CardTitle className="text-lg">Dados da Loja</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {settingsKeys.slice(0, 3).map(({ key, label, placeholder }) => (
              <div key={key}>
                <label className="text-sm font-medium">{label}</label>
                <Input
                  placeholder={placeholder}
                  value={settings[key] || ""}
                  onChange={(e) => setSettings({ ...settings, [key]: e.target.value })}
                />
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
                <Input
                  placeholder={placeholder}
                  value={settings[key] || ""}
                  onChange={(e) => setSettings({ ...settings, [key]: e.target.value })}
                />
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
                <Input
                  placeholder={placeholder}
                  value={settings[key] || ""}
                  onChange={(e) => setSettings({ ...settings, [key]: e.target.value })}
                />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminSettings;
