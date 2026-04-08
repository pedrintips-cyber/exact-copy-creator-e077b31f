import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, MapPin, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useCart } from "@/hooks/useCart";

const formatPrice = (price: number) => `R$ ${price.toFixed(2).replace(".", ",")}`;

const paymentOptions = [
  { value: "pix", label: "Pix" },
  { value: "dinheiro", label: "Dinheiro" },
  { value: "cartao", label: "Cartão" },
] as const;

const CartPage = () => {
  const { items, subtotal, updateQuantity, removeItem, clearCart } = useCart();
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<(typeof paymentOptions)[number]["value"]>("pix");
  const [errorMessage, setErrorMessage] = useState("");

  const orderLines = useMemo(
    () =>
      items.map((item) => {
        const selections = item.selections
          .map((group) => `${group.groupName}: ${group.items.map((option) => option.name).join(", ")}`)
          .join(" | ");

        return `• ${item.quantity}x ${item.productName}${selections ? ` (${selections})` : ""} - ${formatPrice(item.totalPrice)}`;
      }),
    [items],
  );

  const handleFinalize = () => {
    if (items.length === 0) {
      setErrorMessage("Adicione pelo menos 1 item para continuar.");
      return;
    }

    if (!customerName.trim() || !phone.trim() || !address.trim()) {
      setErrorMessage("Preencha nome, telefone e endereço antes de continuar.");
      return;
    }

    setErrorMessage("");

    const paymentLabel = paymentOptions.find((option) => option.value === paymentMethod)?.label ?? "Pix";

    const text = encodeURIComponent(
      `🍕 *Novo pedido*\n\n*Cliente:* ${customerName}\n*Telefone:* ${phone}\n*Endereço:* ${address}${reference ? `\n*Referência:* ${reference}` : ""}\n*Pagamento:* ${paymentLabel}${notes ? `\n*Observações:* ${notes}` : ""}\n\n*Itens*\n${orderLines.join("\n")}\n\n*Total:* ${formatPrice(subtotal)}`,
    );

    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex min-h-screen max-w-lg flex-col px-4 py-4 pb-8">
        <div className="mb-4 flex items-center justify-between gap-3">
          <Link to="/" className="inline-flex items-center gap-2 text-xs text-muted-foreground">
            <ArrowLeft className="h-4 w-4" /> Voltar ao cardápio
          </Link>
          {items.length > 0 && (
            <button type="button" onClick={clearCart} className="text-xs font-medium text-muted-foreground">
              Limpar carrinho
            </button>
          )}
        </div>

        <div className="mb-4 rounded-3xl border border-border bg-card p-4 shadow-sm">
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
            <ShoppingBag className="h-3.5 w-3.5" /> Checkout
          </div>
          <h1 className="text-xl font-black text-foreground">Seu pedido</h1>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            Revise os itens, preencha seus dados e siga para o pagamento do jeito certo no celular.
          </p>
        </div>

        {items.length === 0 ? (
          <div className="rounded-3xl border border-border bg-card p-8 text-center shadow-sm">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full border border-border bg-background text-primary">
              <ShoppingBag className="h-6 w-6" />
            </div>
            <p className="text-base font-semibold">Seu carrinho está vazio.</p>
            <p className="mt-2 text-sm text-muted-foreground">Escolha uma pizza para montar um pedido bonito e completo.</p>
            <Link to="/" className="mt-4 inline-flex text-sm font-semibold text-primary">
              Ver cardápio
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            <section className="rounded-3xl border border-border bg-card p-4 shadow-sm">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-sm font-bold text-foreground">Itens do pedido</h2>
                  <p className="text-xs text-muted-foreground">Tudo compacto, sem preço estourando do card.</p>
                </div>
                <span className="rounded-full border border-border bg-background px-3 py-1 text-[10px] font-semibold text-muted-foreground">
                  {items.length} item{items.length > 1 ? "s" : ""}
                </span>
              </div>

              <div className="space-y-3">
                {items.map((item) => (
                  <article key={item.id} className="rounded-2xl border border-border bg-background p-3">
                    <div className="flex gap-3">
                      <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-border bg-card">
                        {item.productImageUrl ? (
                          <img src={item.productImageUrl} alt={item.productName} className="h-full w-full object-contain" />
                        ) : (
                          <span className="text-3xl">🍕</span>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <h3 className="truncate text-sm font-bold text-foreground">{item.productName}</h3>
                            <p className="text-xs text-muted-foreground">{formatPrice(item.unitPrice)} cada</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeItem(item.id)}
                            className="shrink-0 rounded-full border border-border bg-card p-2 text-muted-foreground transition-colors hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>

                        {item.selections.length > 0 && (
                          <div className="mt-2 space-y-1 text-[11px] leading-relaxed text-muted-foreground">
                            {item.selections.map((group) => (
                              <p key={group.groupId}>
                                <span className="font-semibold text-foreground">{group.groupName}:</span>{" "}
                                {group.items.map((option) => option.name).join(", ")}
                              </p>
                            ))}
                          </div>
                        )}

                        <div className="mt-3 flex items-center justify-between gap-3">
                          <div className="flex items-center rounded-full border border-border bg-card p-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-full"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </Button>
                            <span className="min-w-8 text-center text-sm font-bold">{item.quantity}</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-full"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                          <p className="max-w-[110px] text-right text-sm font-bold leading-tight text-success break-words">
                            {formatPrice(item.totalPrice)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section className="rounded-3xl border border-border bg-card p-4 shadow-sm">
              <div className="mb-3 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                <div>
                  <h2 className="text-sm font-bold text-foreground">Entrega</h2>
                  <p className="text-xs text-muted-foreground">Preencha os dados do cliente sem poluir a tela.</p>
                </div>
              </div>

              <div className="space-y-3">
                <Input value={customerName} onChange={(event) => setCustomerName(event.target.value)} placeholder="Nome do cliente" />
                <Input value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="Telefone / WhatsApp" inputMode="tel" />
                <Input value={address} onChange={(event) => setAddress(event.target.value)} placeholder="Endereço / localização" />
                <Input value={reference} onChange={(event) => setReference(event.target.value)} placeholder="Complemento ou referência" />
              </div>
            </section>

            <section className="rounded-3xl border border-border bg-card p-4 shadow-sm">
              <div className="mb-3">
                <h2 className="text-sm font-bold text-foreground">Pagamento</h2>
                <p className="text-xs text-muted-foreground">Escolha a forma de pagamento e observações do pedido.</p>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {paymentOptions.map((option) => (
                  <Button
                    key={option.value}
                    type="button"
                    variant={paymentMethod === option.value ? "default" : "outline"}
                    className="h-10 rounded-2xl text-xs"
                    onClick={() => setPaymentMethod(option.value)}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>

              <Textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Observações do pedido"
                className="mt-3 min-h-24 resize-none"
              />
            </section>

            <section className="rounded-3xl border border-border bg-card p-4 shadow-sm">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-semibold text-foreground">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Entrega</span>
                  <span className="font-semibold text-foreground">A combinar</span>
                </div>
                <div className="flex items-center justify-between border-t border-border pt-3">
                  <span className="text-sm font-semibold text-foreground">Total do pedido</span>
                  <span className="text-lg font-black text-success">{formatPrice(subtotal)}</span>
                </div>
              </div>

              {errorMessage && (
                <div className="mt-3 rounded-2xl border border-border bg-background px-3 py-2 text-xs text-muted-foreground">
                  {errorMessage}
                </div>
              )}

              <Button onClick={handleFinalize} className="mt-4 h-11 w-full rounded-2xl text-sm font-semibold">
                Confirmar pedido
              </Button>
            </section>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;