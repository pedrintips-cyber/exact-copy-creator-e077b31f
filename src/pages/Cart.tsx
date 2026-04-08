import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Minus, Plus, ShoppingBag, Trash2, User, CreditCard, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useCart } from "@/hooks/useCart";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const formatPrice = (price: number) => `R$ ${price.toFixed(2).replace(".", ",")}`;

const CartPage = () => {
  const navigate = useNavigate();
  const { items, subtotal, updateQuantity, removeItem, clearCart } = useCart();
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFinalize = async () => {
    if (items.length === 0) {
      toast.error("Adicione pelo menos 1 item.");
      return;
    }
    if (!customerName.trim() || !phone.trim() || !address.trim()) {
      toast.error("Preencha nome, telefone e endereço.");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-payment", {
        body: {
          customerName: customerName.trim(),
          customerPhone: phone.trim(),
          address: address.trim(),
          items: items.map((i) => ({
            name: i.productName,
            quantity: i.quantity,
            unitPrice: i.unitPrice,
            totalPrice: i.totalPrice,
            selections: i.selections,
          })),
          subtotal,
          notes: notes.trim(),
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      const params = new URLSearchParams({
        order_id: data.orderId,
        transaction_id: String(data.transactionId),
        qr_code: data.qrCode || "",
        qr_code_base64: data.qrCodeBase64 || "",
        amount: String(data.amount),
        expires_at: data.expiresAt || "",
      });

      navigate(`/pagamento?${params.toString()}`);
    } catch (err: any) {
      console.error("Payment error:", err);
      toast.error(err.message || "Erro ao processar pagamento.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex min-h-screen max-w-lg flex-col px-4 py-4 pb-8">
        <div className="mb-4 flex items-center justify-between gap-3">
          <Link to="/" className="inline-flex items-center gap-2 text-xs text-muted-foreground">
            <ArrowLeft className="h-4 w-4" /> Voltar
          </Link>
          {items.length > 0 && (
            <button type="button" onClick={clearCart} className="text-xs font-medium text-muted-foreground">
              Limpar
            </button>
          )}
        </div>

        <div className="mb-4 rounded-3xl border border-border bg-card p-4 shadow-sm">
          <div className="mb-1 inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
            <ShoppingBag className="h-3.5 w-3.5" /> Checkout
          </div>
          <h1 className="text-lg font-black text-foreground">Seu pedido</h1>
        </div>

        {items.length === 0 ? (
          <div className="rounded-3xl border border-border bg-card p-8 text-center shadow-sm">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full border border-border bg-background text-primary">
              <ShoppingBag className="h-6 w-6" />
            </div>
            <p className="text-base font-semibold">Carrinho vazio</p>
            <Link to="/" className="mt-3 inline-flex text-sm font-semibold text-primary">
              Ver cardápio
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Items */}
            <section className="rounded-3xl border border-border bg-card p-4 shadow-sm">
              <h2 className="mb-3 text-sm font-bold text-foreground">
                Itens ({items.length})
              </h2>
              <div className="space-y-2">
                {items.map((item) => (
                  <article key={item.id} className="rounded-2xl border border-border bg-background p-3">
                    <div className="flex gap-3">
                      <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-card">
                        {item.productImageUrl ? (
                          <img src={item.productImageUrl} alt={item.productName} className="h-full w-full object-cover" />
                        ) : (
                          <span className="text-2xl">🍕</span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="truncate text-sm font-bold text-foreground">{item.productName}</h3>
                          <button type="button" onClick={() => removeItem(item.id)} className="shrink-0 text-muted-foreground hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        {item.selections.length > 0 && (
                          <div className="mt-1 space-y-0.5 text-[11px] text-muted-foreground">
                            {item.selections.map((g) => (
                              <p key={g.groupId}>
                                <span className="font-semibold text-foreground">{g.groupName}:</span>{" "}
                                {g.items.map((o) => o.name).join(", ")}
                              </p>
                            ))}
                          </div>
                        )}
                        <div className="mt-2 flex items-center justify-between">
                          <div className="flex items-center rounded-full border border-border bg-card">
                            <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full" onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="min-w-6 text-center text-xs font-bold">{item.quantity}</span>
                            <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          <p className="text-sm font-bold text-primary">{formatPrice(item.totalPrice)}</p>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            {/* Customer info */}
            <section className="rounded-3xl border border-border bg-card p-4 shadow-sm">
              <div className="mb-3 flex items-center gap-2">
                <User className="h-4 w-4 text-primary" />
                <h2 className="text-sm font-bold text-foreground">Seus dados</h2>
              </div>
              <div className="space-y-2">
                <Input value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Nome completo *" />
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Telefone / WhatsApp *" inputMode="tel" />
                <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Endereço de entrega *" />
                <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Observações" className="min-h-20 resize-none" />
              </div>
            </section>

            {/* Payment */}
            <section className="rounded-3xl border border-border bg-card p-4 shadow-sm">
              <div className="mb-3 flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-primary" />
                <h2 className="text-sm font-bold text-foreground">Pagamento</h2>
              </div>
              <div className="rounded-2xl border border-primary/20 bg-primary/5 p-3 text-center">
                <p className="text-xs font-semibold text-primary">PIX</p>
                <p className="text-[11px] text-muted-foreground">O QR Code será gerado após confirmar</p>
              </div>
            </section>

            {/* Total + Button */}
            <section className="rounded-3xl border border-border bg-card p-4 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-semibold text-foreground">Total</span>
                <span className="text-lg font-black text-primary">{formatPrice(subtotal)}</span>
              </div>
              <Button onClick={handleFinalize} disabled={loading} className="h-11 w-full rounded-2xl text-sm font-semibold">
                {loading ? (
                  <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Processando...</span>
                ) : (
                  "Pagar com PIX"
                )}
              </Button>
            </section>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;
