import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
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
    const { userStatement } = await req.json();
    
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");
    
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    
    if (!user) {
      throw new Error("User not authenticated");
    }

    // Get user's subscription
    const { data: subscription, error: subError } = await supabaseClient
      .from("user_subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (subError || !subscription) {
      throw new Error("No subscription found");
    }

    if (subscription.plan_type !== "annual") {
      throw new Error("Only annual subscribers can claim the booking guarantee");
    }

    // Check if already claimed
    const { data: existingClaim } = await supabaseClient
      .from("booking_guarantee_claims")
      .select("*")
      .eq("user_id", user.id)
      .eq("subscription_id", subscription.id)
      .single();

    if (existingClaim) {
      throw new Error("You have already submitted a claim for this subscription period");
    }

    // Create claim
    const { data: claim, error: claimError } = await supabaseClient
      .from("booking_guarantee_claims")
      .insert({
        user_id: user.id,
        subscription_id: subscription.id,
        subscription_year_start: subscription.current_period_start,
        subscription_year_end: subscription.current_period_end,
        user_statement: userStatement,
        claim_status: "pending",
        refund_amount_cents: 3999, // $39.99
      })
      .select()
      .single();

    if (claimError) throw claimError;

    console.log("Guarantee claim created:", claim.id);

    return new Response(
      JSON.stringify({ success: true, claim }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error("Error submitting guarantee claim:", error);
    return new Response(
      JSON.stringify({ error: error?.message || "Unknown error" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
