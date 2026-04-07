import { useEffect, useMemo, useState } from "react";
import { Plus, Settings2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

interface ProductSummary {
  id: string;
  name: string;
}

interface ProductOptionGroup {
  id: string;
  name: string;
  description: string | null;
  selection_type: "single" | "multiple";
  min_select: number;
  max_select: number;
  sort_order: number;
  active: boolean;
}

interface ProductOptionItem {
  id: string;
  option_group_id: string;
  name: string;
  price_adjustment: number;
  sort_order: number;
  active: boolean;
}

interface ItemFormState {
  name: string;
  price_adjustment: string;
  sort_order: string;
}

const emptyItemForm: ItemFormState = {
  name: "",
  price_adjustment: "0",
  sort_order: "0",
};

export function ProductCustomizationDialog({ product }: { product: ProductSummary }) {
  const [open, setOpen] = useState(false);
  const [groups, setGroups] = useState<ProductOptionGroup[]>([]);
  const [items, setItems] = useState<ProductOptionItem[]>([]);
  const [groupForm, setGroupForm] = useState({
    name: "",
    description: "",
    selection_type: "single",
    min_select: "1",
    max_select: "1",
    sort_order: "0",
  });
  const [itemForms, setItemForms] = useState<Record<string, ItemFormState>>({});

  const db = supabase as any;

  const loadData = async () => {
    const { data: groupData, error: groupError } = await db
      .from("product_option_groups")
      .select("*")
      .eq("product_id", product.id)
      .order("sort_order");

    if (groupError) {
      toast.error(groupError.message);
      return;
    }

    const groupIds = (groupData || []).map((group: ProductOptionGroup) => group.id);

    if (groupIds.length === 0) {
      setGroups(groupData || []);
      setItems([]);
      return;
    }

    const { data: itemData, error: itemError } = await db
      .from("product_option_items")
      .select("*")
      .in("option_group_id", groupIds)
      .order("sort_order");

    if (itemError) {
      toast.error(itemError.message);
      return;
    }

    setGroups(groupData || []);
    setItems(itemData || []);
  };

  useEffect(() => {
    if (open) {
      void loadData();
    }
  }, [open]);

  const groupedItems = useMemo(
    () =>
      items.reduce<Record<string, ProductOptionItem[]>>((acc, item) => {
        acc[item.option_group_id] = [...(acc[item.option_group_id] || []), item];
        return acc;
      }, {}),
    [items],
  );

  const resetGroupForm = () => {
    setGroupForm({
      name: "",
      description: "",
      selection_type: "single",
      min_select: "1",
      max_select: "1",
      sort_order: "0",
    });
  };

  const createGroup = async () => {
    const minSelect = Number(groupForm.min_select || 0);
    const maxSelect = Number(groupForm.max_select || 0);

    if (!groupForm.name.trim()) {
      toast.error("Dê um nome para o grupo.");
      return;
    }

    if (maxSelect < minSelect) {
      toast.error("O máximo precisa ser maior ou igual ao mínimo.");
      return;
    }

    const { error } = await db.from("product_option_groups").insert({
      product_id: product.id,
      name: groupForm.name,
      description: groupForm.description || null,
      selection_type: groupForm.selection_type,
      min_select: minSelect,
      max_select: maxSelect,
      sort_order: Number(groupForm.sort_order || 0),
    });

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Grupo criado.");
    resetGroupForm();
    loadData();
  };

  const deleteGroup = async (groupId: string) => {
    const { error } = await db.from("product_option_groups").delete().eq("id", groupId);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Grupo removido.");
    loadData();
  };

  const toggleGroupActive = async (group: ProductOptionGroup) => {
    const { error } = await db
      .from("product_option_groups")
      .update({ active: !group.active })
      .eq("id", group.id);

    if (error) {
      toast.error(error.message);
      return;
    }

    loadData();
  };

  const updateItemForm = (groupId: string, updates: Partial<ItemFormState>) => {
    setItemForms((current) => ({
      ...current,
      [groupId]: {
        ...(current[groupId] || emptyItemForm),
        ...updates,
      },
    }));
  };

  const createItem = async (groupId: string) => {
    const form = itemForms[groupId] || emptyItemForm;

    if (!form.name.trim()) {
      toast.error("Dê um nome para a opção.");
      return;
    }

    const { error } = await db.from("product_option_items").insert({
      option_group_id: groupId,
      name: form.name,
      price_adjustment: Number(form.price_adjustment || 0),
      sort_order: Number(form.sort_order || 0),
    });

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Opção criada.");
    setItemForms((current) => ({ ...current, [groupId]: emptyItemForm }));
    loadData();
  };

  const deleteItem = async (itemId: string) => {
    const { error } = await db.from("product_option_items").delete().eq("id", itemId);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Opção removida.");
    loadData();
  };

  const toggleItemActive = async (item: ProductOptionItem) => {
    const { error } = await db
      .from("product_option_items")
      .update({ active: !item.active })
      .eq("id", item.id);

    if (error) {
      toast.error(error.message);
      return;
    }

    loadData();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1">
          <Settings2 className="h-4 w-4" /> Personalizar
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] max-w-[95vw] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Personalização · {product.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Card>
            <CardContent className="space-y-3 p-4">
              <h3 className="font-semibold">Novo grupo de escolha</h3>
              <div className="grid gap-2 sm:grid-cols-2">
                <Input
                  placeholder="Ex.: Sabor da pizza"
                  value={groupForm.name}
                  onChange={(e) => setGroupForm((current) => ({ ...current, name: e.target.value }))}
                />
                <Input
                  placeholder="Descrição"
                  value={groupForm.description}
                  onChange={(e) => setGroupForm((current) => ({ ...current, description: e.target.value }))}
                />
              </div>

              <div className="grid gap-2 sm:grid-cols-4">
                <Select
                  value={groupForm.selection_type}
                  onValueChange={(value) => setGroupForm((current) => ({ ...current, selection_type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single">Escolha única</SelectItem>
                    <SelectItem value="multiple">Múltipla escolha</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  placeholder="Mínimo"
                  value={groupForm.min_select}
                  onChange={(e) => setGroupForm((current) => ({ ...current, min_select: e.target.value }))}
                />
                <Input
                  type="number"
                  placeholder="Máximo"
                  value={groupForm.max_select}
                  onChange={(e) => setGroupForm((current) => ({ ...current, max_select: e.target.value }))}
                />
                <Input
                  type="number"
                  placeholder="Ordem"
                  value={groupForm.sort_order}
                  onChange={(e) => setGroupForm((current) => ({ ...current, sort_order: e.target.value }))}
                />
              </div>

              <Button onClick={createGroup} className="gap-2">
                <Plus className="h-4 w-4" /> Adicionar grupo
              </Button>
            </CardContent>
          </Card>

          {groups.length === 0 && (
            <p className="text-sm text-muted-foreground">Ainda não existem grupos de personalização para este produto.</p>
          )}

          {groups.map((group) => {
            const form = itemForms[group.id] || emptyItemForm;

            return (
              <Card key={group.id}>
                <CardContent className="space-y-4 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold">{group.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {group.selection_type === "single" ? "Escolha única" : "Múltipla escolha"} · min {group.min_select} · max {group.max_select}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>Ativo</span>
                        <Switch checked={group.active} onCheckedChange={() => toggleGroupActive(group)} />
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => deleteGroup(group.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {(groupedItems[group.id] || []).map((item) => (
                      <div key={item.id} className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-background p-3">
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Ajuste: {item.price_adjustment > 0 ? `+R$ ${Number(item.price_adjustment).toFixed(2)}` : "sem acréscimo"}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch checked={item.active} onCheckedChange={() => toggleItemActive(item)} />
                          <Button variant="ghost" size="icon" onClick={() => deleteItem(item.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="grid gap-2 sm:grid-cols-[1fr_140px_120px_auto]">
                    <Input
                      placeholder="Ex.: Calabresa"
                      value={form.name}
                      onChange={(e) => updateItemForm(group.id, { name: e.target.value })}
                    />
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="Acréscimo"
                      value={form.price_adjustment}
                      onChange={(e) => updateItemForm(group.id, { price_adjustment: e.target.value })}
                    />
                    <Input
                      type="number"
                      placeholder="Ordem"
                      value={form.sort_order}
                      onChange={(e) => updateItemForm(group.id, { sort_order: e.target.value })}
                    />
                    <Button onClick={() => createItem(group.id)}>Salvar opção</Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}