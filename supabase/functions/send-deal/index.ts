import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.74.0";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface SendDealRequest {
  dealId: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Verify admin access
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      throw new Error("Unauthorized");
    }

    // Check if user is admin
    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleData) {
      throw new Error("Unauthorized - admin access required");
    }

    const { dealId }: SendDealRequest = await req.json();

    // Get deal details with destination info
    const { data: deal, error: dealError } = await supabase
      .from("deals")
      .select("*, destinations(city_name, country)")
      .eq("id", dealId)
      .single();

    if (dealError || !deal) {
      throw new Error("Deal not found");
    }

    if (deal.sent_to_subscribers) {
      throw new Error("Deal already sent to subscribers");
    }

    // Get active subscribers
    const { data: subscribers, error: subsError } = await supabase
      .from("subscribers")
      .select("email, name")
      .eq("is_active", true)
      .eq("is_verified", true);

    if (subsError) {
      throw new Error("Failed to fetch subscribers");
    }

    if (!subscribers || subscribers.length === 0) {
      throw new Error("No active subscribers found");
    }

    // Prepare email content
    const subject = `🌴 Amazing Deal: ${deal.destinations.city_name}, ${deal.destinations.country} - $${deal.price}`;
    const outboundDate = new Date(deal.outbound_date).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
    const returnDate = new Date(deal.return_date).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });

    // Send emails to all subscribers
    const emailPromises = subscribers.map(async (subscriber) => {
      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #2b9fdb 0%, #4db8f0 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: white; padding: 30px; border: 1px solid #e5e7eb; }
              .deal-box { background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; }
              .price { font-size: 36px; font-weight: bold; color: #ea580c; }
              .button { display: inline-block; background: #ea580c; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; margin: 20px 0; }
              .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>✈️ Incredible Travel Deal Alert!</h1>
              </div>
              <div class="content">
                <p>Hi ${subscriber.name || "there"},</p>
                <p>We've found an amazing deal that we thought you'd love!</p>
                
                <div class="deal-box">
                  <h2>${deal.destinations.city_name}, ${deal.destinations.country}</h2>
                  <div class="price">$${deal.price}</div>
                  <p><strong>Outbound:</strong> ${outboundDate}</p>
                  <p><strong>Return:</strong> ${returnDate}</p>
                </div>

                <p>This is a limited-time offer, so don't wait too long!</p>
                
                <a href="${deal.booking_link}" class="button">Book Now</a>

                <p>Happy travels!</p>
              </div>
              <div class="footer">
                <p>You're receiving this because you subscribed to our travel deals newsletter.</p>
              </div>
            </div>
          </body>
        </html>
      `;

      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: "Travel Deals <onboarding@resend.dev>",
          to: [subscriber.email],
          subject,
          html,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to send email: ${error}`);
      }

      return response.json();
    });

    await Promise.all(emailPromises);

    // Update deal status
    await supabase
      .from("deals")
      .update({ sent_to_subscribers: true, sent_at: new Date().toISOString() })
      .eq("id", dealId);

    // Record email sent
    await supabase.from("sent_emails").insert({
      deal_id: dealId,
      subscriber_count: subscribers.length,
      subject,
    });

    return new Response(
      JSON.stringify({ success: true, count: subscribers.length }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-deal function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
