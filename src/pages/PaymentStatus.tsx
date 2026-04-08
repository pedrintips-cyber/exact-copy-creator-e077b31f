import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { CheckCircle2, Clock, Copy, XCircle, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/hooks/useCart";
import { toast } from "sonner";

const formatPrice = (cents: number) => `R$ ${(cents / 100).toFixed(2).replace(".", ",")}`;

type PaymentState = "pending" | "approved" | "failed" | "expired";

const PaymentStatus = () => {
  const [params] = useSearchParams();
  const { clearCart } = useCart();

  const orderId = params.get("order_id") ?? "";
  const transactionId = params.get("transaction_id") ?? "";
  const qrCode = params.get("qr_code") ?? "";
  const qrCodeBase64 = params.get("qr_code_base64") ?? "";
  const amount = Number(params.get("amount") ?? "0");
  const expiresAt = params.get("expires_at") ?? "";

  const [status, setStatus] = useState<PaymentState>("pending");
  const [polling, setPolling] = useState(true);

  useEffect(() => {
    if (!transactionId || status !== "pending") return;

    const interval = setInterval(async () => {
      try {
        const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
        const res = await fetch(
          `https://${projectId}.supabase.co/functions/v1/check-payment?transaction_id=${transactionId}`,
          {
            headers: {
              Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
              apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            },
          }
        );
        const result = await res.json();

        if (result.status === "approved") {
          setStatus("approved");
          setPolling(false);
          clearCart();
        } else if (result.status === "failed") {
          setStatus("failed");
          setPolling(false);
        }
      } catch (err) {
        console.error("Poll error:", err);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [transactionId, status, clearCart]);

  const handleCopyCode = () => {
    if (qrCode) {
      navigator.clipboard.writeText(qrCode);
      toast.success("Código PIX copiado!");
    }
  };

  if (status === "approved") {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center px-4 py-8 text-center">
          <div className="rounded-3xl border border-border bg-card p-8 shadow-sm w-full">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-green-600">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <h1 className="text-2xl font-black text-foreground">Pagamento confirmado!</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Seu pedido foi recebido e está sendo preparado. Obrigado pela preferência!
            </p>
            <p className="mt-4 text-xs text-muted-foreground">
              Pedido: <span className="font-mono font-semibold">{orderId.slice(0, 8)}</span>
            </p>
            <Link to="/">
              <Button className="mt-6 w-full rounded-2xl">Voltar ao cardápio</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (status === "failed") {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center px-4 py-8 text-center">
          <div className="rounded-3xl border border-border bg-card p-8 shadow-sm w-full">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-red-100 text-red-600">
              <XCircle className="h-10 w-10" />
            </div>
            <h1 className="text-2xl font-black text-foreground">Pagamento não realizado</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              O pagamento expirou ou foi cancelado. Tente novamente.
            </p>
            <Link to="/carrinho">
              <Button className="mt-6 w-full rounded-2xl">Voltar ao carrinho</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex min-h-screen max-w-lg flex-col px-4 py-4 pb-8">
        <Link to="/carrinho" className="mb-4 inline-flex items-center gap-2 text-xs text-muted-foreground">
          <ArrowLeft className="h-4 w-4" /> Voltar ao carrinho
        </Link>

        <div className="space-y-4">
          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm text-center">
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
              <Clock className="h-3.5 w-3.5" /> Aguardando pagamento
            </div>
            <h1 className="text-xl font-black text-foreground">Pague via PIX</h1>
            <p className="mt-1 text-xs text-muted-foreground">
              Escaneie o QR Code ou copie o código para pagar
            </p>

            <div className="mt-4 text-2xl font-black text-primary">
              {formatPrice(amount)}
            </div>

            {expiresAt && (
              <p className="mt-1 text-[10px] text-muted-foreground">
                Expira em: {expiresAt}
              </p>
            )}
          </div>

          {qrCodeBase64 && (
            <div className="rounded-3xl border border-border bg-card p-6 shadow-sm flex flex-col items-center">
              <div className="rounded-2xl border border-border bg-white p-4">
                <img src={qrCodeBase64} alt="QR Code PIX" className="h-48 w-48" />
              </div>
            </div>
          )}

          <div className="rounded-3xl border border-border bg-card p-4 shadow-sm">
            <p className="mb-2 text-xs font-semibold text-foreground">Código PIX (Copia e Cola)</p>
            <div className="flex gap-2">
              <div className="flex-1 overflow-hidden rounded-xl border border-border bg-background px-3 py-2">
                <p className="truncate text-xs font-mono text-muted-foreground">{qrCode}</p>
              </div>
              <Button onClick={handleCopyCode} variant="outline" size="icon" className="shrink-0 rounded-xl">
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-card p-4 shadow-sm flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            <p className="text-xs text-muted-foreground">Verificando pagamento automaticamente...</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentStatus;
