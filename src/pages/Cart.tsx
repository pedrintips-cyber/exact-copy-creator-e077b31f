import { Link } from "react-router-dom";
import { ArrowLeft, Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/useCart";

const formatPrice = (price: number) => `R$ ${price.toFixed(2).replace(".", ",")}`;

const CartPage = () => {
  const { items, subtotal, updateQuantity, removeItem, clearCart } = useCart();

  const handleFinalize = () => {
    if (items.length === 0) {
      toast.error("Seu carrinho está vazio.");
      return;
    }

    const lines = items.map((item) => {
      const selections = item.selections
        .map((group) => `${group.groupName}: ${group.items.map((option) => option.name).join(", ")}`)
        .join(" | ");

      return `• ${item.quantity}x ${item.productName}${selections ? ` (${selections})` : ""} - ${formatPrice(item.totalPrice)}`;
    });

    const text = encodeURIComponent(
      `🍕 *Novo pedido*\n\n${lines.join("\n")}\n\n*Total:* ${formatPrice(subtotal)}`,
    );

    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-background pb-32">
      <div className="container max-w-3xl px-4 py-4">
        <div className="mb-6 flex items-center justify-between gap-3">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground">
            <ArrowLeft className="h-4 w-4" /> Continuar comprando
          </Link>
          {items.length > 0 && (
            <button type="button" onClick={clearCart} className="text-sm font-medium text-destructive">
              Limpar carrinho
            </button>
          )}
        </div>

        <h1 className="mb-4 flex items-center gap-2 text-2xl font-black">
          <ShoppingCart className="h-6 w-6 text-primary" /> Carrinho
        </h1>

        {items.length === 0 ? (
          <div className="rounded-3xl border border-border bg-card p-8 text-center">
            <p className="text-lg font-semibold">Seu carrinho está vazio.</p>
            <p className="mt-2 text-sm text-muted-foreground">Escolha uma pizza para começar seu pedido.</p>
            <Link to="/" className="mt-4 inline-flex text-sm font-semibold text-primary">
              Ver cardápio
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.id} className="rounded-3xl border border-border bg-card p-4 shadow-sm">
                <div className="flex gap-4">
                  <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl border border-border bg-muted shrink-0">
                    {item.productImageUrl ? (
                      <img src={item.productImageUrl} alt={item.productName} className="h-full w-full object-contain" />
                    ) : (
                      <span className="text-3xl">🍕</span>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h2 className="font-bold text-foreground">{item.productName}</h2>
                        <p className="text-sm text-muted-foreground">{formatPrice(item.unitPrice)} cada</p>
                      </div>
                      <button type="button" onClick={() => removeItem(item.id)} className="text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    {item.selections.length > 0 && (
                      <div className="mt-3 space-y-1 text-sm text-muted-foreground">
                        {item.selections.map((group) => (
                          <p key={group.groupId}>
                            <span className="font-medium text-foreground">{group.groupName}:</span>{" "}
                            {group.items.map((option) => option.name).join(", ")}
                          </p>
                        ))}
                      </div>
                    )}

                    <div className="mt-4 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="icon" onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="min-w-8 text-center font-bold">{item.quantity}</span>
                        <Button size="icon" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-lg font-black text-success">{formatPrice(item.totalPrice)}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {items.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 border-t border-border bg-card/95 p-4 backdrop-blur">
          <div className="container flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="text-2xl font-black text-success">{formatPrice(subtotal)}</p>
            </div>
            <Button onClick={handleFinalize} className="gap-2">
              <ShoppingCart className="h-4 w-4" /> Finalizar pedido
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;