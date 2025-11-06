import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  try {
    const { claimId, approve, adminNotes } = await req.json();
    
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");
    
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const adminUser = data.user;
    
    if (!adminUser) {
      throw new Error("User not authenticated");
    }

    // Verify admin
    const { data: isAdmin } = await supabaseClient.rpc("is_admin", {
      _user_id: adminUser.id,
    });

    if (!isAdmin) {
      throw new Error("Unauthorized");
    }

    // Get claim
    const { data: claim, error: claimError } = await supabaseClient
      .from("booking_guarantee_claims")
      .select("*, user_subscriptions(*)")
      .eq("id", claimId)
      .single();

    if (claimError || !claim) {
      throw new Error("Claim not found");
    }

    if (!approve) {
      // Reject claim
      await supabaseClient
        .from("booking_guarantee_claims")
        .update({
          claim_status: "rejected",
          admin_notes: adminNotes,
          reviewed_by: adminUser.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", claimId);

      return new Response(
        JSON.stringify({ success: true, message: "Claim rejected" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    // Approve and process refund
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const subscription = claim.user_subscriptions;
    
    // Get the last payment intent for this subscription
    const paymentIntents = await stripe.paymentIntents.list({
      customer: subscription.stripe_customer_id,
      limit: 10,
    });

    const subscriptionPayment = paymentIntents.data.find(
      (pi: any) => pi.metadata?.subscription_id === subscription.stripe_subscription_id
    );

    if (!subscriptionPayment) {
      throw new Error("No payment found for this subscription");
    }

    // Issue refund
    const refund = await stripe.refunds.create({
      payment_intent: subscriptionPayment.id,
      amount: claim.refund_amount_cents,
      reason: "requested_by_customer",
    });

    // Update claim
    await supabaseClient
      .from("booking_guarantee_claims")
      .update({
        claim_status: "refunded",
        admin_notes: adminNotes,
        reviewed_by: adminUser.id,
        reviewed_at: new Date().toISOString(),
        stripe_refund_id: refund.id,
        refund_issued_at: new Date().toISOString(),
      })
      .eq("id", claimId);

    console.log("Refund processed:", refund.id);

    return new Response(
      JSON.stringify({ success: true, refund }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error("Error processing refund:", error);
    return new Response(
      JSON.stringify({ error: error?.message || "Unknown error" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
