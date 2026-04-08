import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2/cors";

const PARADISE_API_URL = "https://multi.paradisepags.com/api/v1";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const PARADISE_API_KEY = Deno.env.get("PARADISE_API_KEY");
    if (!PARADISE_API_KEY) {
      return new Response(JSON.stringify({ error: "PARADISE_API_KEY not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const body = await req.json();
    const { customerName, customerEmail, customerPhone, customerDocument, address, items, subtotal, paymentMethod, notes } = body;

    if (!customerName || !customerEmail || !customerPhone || !customerDocument || !items?.length || !subtotal) {
      return new Response(JSON.stringify({ error: "Campos obrigatórios faltando" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const amountInCents = Math.round(subtotal * 100);
    const reference = `ORDER-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    // Create order in database first
    const { data: order, error: orderError } = await supabase.from("orders").insert({
      customer_name: customerName,
      customer_phone: customerPhone,
      customer_address: address || null,
      customer_cpf: customerDocument,
      items: items,
      subtotal: subtotal,
      total: subtotal,
      payment_method: "pix",
      notes: notes || null,
      status: "pending",
    }).select().single();

    if (orderError) {
      console.error("Order creation error:", orderError);
      return new Response(JSON.stringify({ error: "Erro ao criar pedido" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create Paradise transaction
    const paradisePayload = {
      amount: amountInCents,
      description: `Pedido #${order.id.slice(0, 8)}`,
      reference: reference,
      source: "api_externa",
      customer: {
        name: customerName,
        email: customerEmail,
        phone: customerPhone.replace(/\D/g, ""),
        document: customerDocument.replace(/\D/g, ""),
      },
    };

    console.log("Paradise request payload:", JSON.stringify(paradisePayload));
    console.log("API Key prefix:", PARADISE_API_KEY.slice(0, 6) + "...");

    const paradiseResponse = await fetch(`${PARADISE_API_URL}/transaction.php`, {
      method: "POST",
      headers: {
        "X-API-Key": PARADISE_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(paradisePayload),
    });

    const paradiseData = await paradiseResponse.json();
    console.log("Paradise response status:", paradiseResponse.status);
    console.log("Paradise response body:", JSON.stringify(paradiseData));

    if (!paradiseResponse.ok || paradiseData.status !== "success") {
      console.error("Paradise API error:", paradiseData);
      // Update order status to failed
      await supabase.from("orders").update({ status: "failed" }).eq("id", order.id);
      return new Response(JSON.stringify({ error: "Erro ao gerar pagamento PIX", details: paradiseData }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Update order with payment info
    await supabase.from("orders").update({
      payment_id: String(paradiseData.transaction_id),
    }).eq("id", order.id);

    return new Response(JSON.stringify({
      orderId: order.id,
      transactionId: paradiseData.transaction_id,
      qrCode: paradiseData.qr_code,
      qrCodeBase64: paradiseData.qr_code_base64,
      amount: paradiseData.amount,
      expiresAt: paradiseData.expires_at,
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(JSON.stringify({ error: "Erro interno do servidor" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
