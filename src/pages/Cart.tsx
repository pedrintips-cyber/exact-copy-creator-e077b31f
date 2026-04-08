import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Minus, Plus, ShoppingBag, Trash2, Loader2 } from "lucide-react";
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
    if (items.length === 0) { toast.error("Adicione pelo menos 1 item."); return; }
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
            name: i.productName, quantity: i.quantity, unitPrice: i.unitPrice,
            totalPrice: i.totalPrice, selections: i.selections,
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
      <div className="sticky top-0 z-20 bg-background border-b border-border px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-foreground">
          <ArrowLeft className="h-5 w-5" />
          <span className="text-sm font-medium">Voltar</span>
        </Link>
        <h1 className="text-base font-bold">Carrinho</h1>
        {items.length > 0 ? (
          <button type="button" onClick={clearCart} className="text-xs text-destructive font-medium">Limpar</button>
        ) : <div className="w-12" />}
      </div>

      <div className="max-w-lg mx-auto px-4 py-4 pb-8 space-y-3">
        {items.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <p className="font-semibold text-foreground">Carrinho vazio</p>
            <Link to="/" className="mt-2 inline-block text-sm font-semibold text-primary">Ver cardápio</Link>
          </div>
        ) : (
          <>
            {/* Items */}
            <div className="space-y-2">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3 p-3 rounded-2xl border border-border bg-card">
                  <div className="w-16 h-16 shrink-0 rounded-xl overflow-hidden bg-muted flex items-center justify-center">
                    {item.productImageUrl ? (
                      <img src={item.productImageUrl} alt={item.productName} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-2xl">🍕</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1">
                      <h3 className="text-sm font-bold text-foreground truncate">{item.productName}</h3>
                      <button onClick={() => removeItem(item.id)} className="shrink-0 p-1 text-muted-foreground">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    {item.selections.length > 0 && (
                      <p className="text-[10px] text-muted-foreground mt-0.5 truncate">
                        {item.selections.map((g) => g.items.map((o) => o.name).join(", ")).join(" · ")}
                      </p>
                    )}
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-0 rounded-full border border-border">
                        <button className="w-7 h-7 flex items-center justify-center" onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-6 text-center text-xs font-bold">{item.quantity}</span>
                        <button className="w-7 h-7 flex items-center justify-center" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <span className="text-sm font-bold text-primary">{formatPrice(item.totalPrice)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Form compacto */}
            <div className="rounded-2xl border border-border bg-card p-4 space-y-2.5">
              <h2 className="text-sm font-bold text-foreground mb-1">Dados para entrega</h2>
              <Input value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Seu nome *" className="h-10 text-sm" />
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="WhatsApp *" inputMode="tel" className="h-10 text-sm" />
              <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Endereço de entrega *" className="h-10 text-sm" />
              <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Observações (opcional)" className="min-h-16 resize-none text-sm" />
            </div>

            {/* PIX info */}
            <div className="rounded-xl bg-primary/10 border border-primary/20 p-3 text-center">
              <p className="text-xs font-semibold text-primary">Pagamento via PIX</p>
              <p className="text-[10px] text-muted-foreground">QR Code gerado após confirmar</p>
            </div>

            {/* Total + CTA */}
            <div className="rounded-2xl border border-border bg-card p-4">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-semibold">Total</span>
                <span className="text-lg font-black text-primary">{formatPrice(subtotal)}</span>
              </div>
              <Button onClick={handleFinalize} disabled={loading} className="w-full h-12 rounded-2xl text-sm font-bold">
                {loading ? (
                  <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Processando...</span>
                ) : (
                  `Pagar ${formatPrice(subtotal)}`
                )}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CartPage;
