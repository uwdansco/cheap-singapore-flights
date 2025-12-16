import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2025-08-27.basil",
});

const supabaseAdmin = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const signature = req.headers.get("stripe-signature");
  
  if (!signature) {
    return new Response("No signature", { status: 400 });
  }

  try {
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    if (!webhookSecret) {
      // Refuse to process unsigned webhooks (prevents spoofed events in misconfigured envs).
      return new Response("STRIPE_WEBHOOK_SECRET not configured", { status: 500 });
    }

    const body = await req.text();
    
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);

    console.log("Webhook event:", event.type);

    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object;
        const customer = await stripe.customers.retrieve(subscription.customer) as any;
        
        if (customer.deleted) break;

        // Find user by customer ID in our subscriptions table
        const { data: userSub } = await supabaseAdmin
          .from("user_subscriptions")
          .select("user_id")
          .eq("stripe_customer_id", subscription.customer)
          .single();

        if (!userSub) {
          console.error("User subscription not found for customer:", subscription.customer);
          break;
        }

        const userId = userSub.user_id;

        // Determine plan type
        const priceId = subscription.items.data[0].price.id;
        let planType = "monthly";
        
        // Check if it's annual based on price
        const price = await stripe.prices.retrieve(priceId);
        if (price.recurring?.interval === "year") {
          planType = "annual";
        }

        // Upsert subscription
        await supabaseAdmin.from("user_subscriptions").upsert({
          user_id: userId,
          stripe_customer_id: subscription.customer,
          stripe_subscription_id: subscription.id,
          plan_type: planType,
          status: subscription.status,
          current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          cancel_at_period_end: subscription.cancel_at_period_end,
          trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
          is_grandfathered: false,
          updated_at: new Date().toISOString(),
        });

        console.log("Subscription updated for user:", userId);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        
        await supabaseAdmin
          .from("user_subscriptions")
          .update({ status: "canceled", updated_at: new Date().toISOString() })
          .eq("stripe_subscription_id", subscription.id);

        console.log("Subscription canceled:", subscription.id);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object;
        
        await supabaseAdmin
          .from("user_subscriptions")
          .update({ status: "past_due", updated_at: new Date().toISOString() })
          .eq("stripe_subscription_id", invoice.subscription);

        console.log("Payment failed for subscription:", invoice.subscription);
        break;
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    console.error("Webhook error:", error);
    return new Response(
      JSON.stringify({ error: error?.message || "Unknown error" }),
      {
        headers: { "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
