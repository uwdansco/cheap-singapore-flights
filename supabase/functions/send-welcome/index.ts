import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.74.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface WelcomeRequest {
  email: string;
  name: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, name }: WelcomeRequest = await req.json();

    console.log("Sending welcome email to:", email);

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get a recent deal to showcase
    const { data: recentDeal } = await supabase
      .from("price_alerts")
      .select(`
        price,
        dates,
        destinations (
          city_name,
          country,
          airport_code
        )
      `)
      .order("received_at", { ascending: false })
      .limit(1)
      .single();

    const siteUrl = Deno.env.get("SITE_URL") || "https://cheapatlantaflights.com";
    const unsubscribeUrl = `${siteUrl}/unsubscribe`;

    let dealExample = "";
    if (recentDeal && recentDeal.destinations) {
      const dest = recentDeal.destinations as any;
      dealExample = `
        <div style="background: linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%); color: white; padding: 24px; border-radius: 12px; margin: 20px 0;">
          <h3 style="margin: 0 0 10px 0; font-size: 24px;">Recent Deal Example</h3>
          <p style="font-size: 32px; font-weight: bold; margin: 10px 0;">$${recentDeal.price}</p>
          <p style="font-size: 18px; margin: 5px 0;">Atlanta → ${dest.city_name}, ${dest.country}</p>
          <p style="font-size: 14px; opacity: 0.9; margin: 5px 0;">${recentDeal.dates}</p>
        </div>
      `;
    }

    // Send welcome email
    const emailResponse = await resend.emails.send({
      from: "Cheap Atlanta Flights <onboarding@resend.dev>",
      to: [email],
      subject: "🎉 Welcome! You're all set for Atlanta flight deals",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f5f5f5;
              }
              .container {
                background-color: #ffffff;
                border-radius: 12px;
                padding: 40px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
              }
              .header {
                text-align: center;
                margin-bottom: 30px;
              }
              .logo {
                font-size: 48px;
                margin-bottom: 10px;
              }
              h1 {
                color: #1e40af;
                font-size: 32px;
                margin: 0 0 10px 0;
              }
              .subtitle {
                color: #6b7280;
                font-size: 18px;
                margin: 0;
              }
              .section {
                margin: 30px 0;
              }
              .section h2 {
                color: #1e40af;
                font-size: 20px;
                margin-bottom: 15px;
              }
              .feature-list {
                background-color: #f0f9ff;
                border-radius: 8px;
                padding: 20px;
                margin: 20px 0;
              }
              .feature-list ul {
                margin: 0;
                padding-left: 20px;
              }
              .feature-list li {
                margin: 10px 0;
              }
              .tip-box {
                background-color: #fef3c7;
                border-left: 4px solid #f59e0b;
                padding: 16px;
                margin: 20px 0;
                border-radius: 4px;
              }
              .tip-box strong {
                color: #92400e;
              }
              .footer {
                text-align: center;
                margin-top: 40px;
                padding-top: 20px;
                border-top: 1px solid #e5e7eb;
                color: #6b7280;
                font-size: 14px;
              }
              .unsubscribe {
                margin-top: 10px;
              }
              .unsubscribe a {
                color: #6b7280;
                text-decoration: underline;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <div class="logo">🎉✈️</div>
                <h1>Welcome Aboard, ${name}!</h1>
                <p class="subtitle">Your subscription is confirmed</p>
              </div>
              
              <div class="section">
                <p>Congratulations! You've successfully joined thousands of savvy travelers who are saving big on flights from Atlanta.</p>
              </div>

              ${dealExample}
              
              <div class="section">
                <h2>What to Expect:</h2>
                <div class="feature-list">
                  <ul>
                    <li><strong>Daily Deal Alerts:</strong> We'll email you the best flight deals as soon as we spot them</li>
                    <li><strong>Incredible Savings:</strong> Expect to save $200-$800 on international flights</li>
                    <li><strong>Handpicked Destinations:</strong> We track over 50 amazing destinations worldwide</li>
                    <li><strong>Flash Sales & Mistake Fares:</strong> Be first to know about rare pricing errors</li>
                    <li><strong>No Spam Promise:</strong> Only quality deals, typically 1-2 emails per day</li>
                  </ul>
                </div>
              </div>
              
              <div class="tip-box">
                <strong>💡 Pro Tip:</strong> Add our email to your contacts or safe sender list so you never miss a deal! The best prices often sell out within hours.
              </div>
              
              <div class="section">
                <h2>What Makes Our Deals Special?</h2>
                <p>We use advanced price tracking algorithms to monitor thousands of flight routes from Atlanta (ATL) 24/7. When we spot an exceptional deal - typically 40-70% below average prices - we immediately notify you.</p>
                <p>Our deals include round-trip flights, often with flexible dates, to destinations across Europe, Asia, Latin America, and more.</p>
              </div>
              
              <div class="section">
                <h2>Ready to Travel?</h2>
                <p>Keep an eye on your inbox! Your first deal alert could arrive any moment. When you see a deal you love, book quickly - the best prices don't last long!</p>
              </div>
              
              <div class="footer">
                <p>Happy travels!</p>
                <p><strong>The Cheap Atlanta Flights Team</strong></p>
                <div class="unsubscribe">
                  <p>Want to manage your subscription? <a href="${unsubscribeUrl}">Click here</a></p>
                </div>
                <p>© ${new Date().getFullYear()} Cheap Atlanta Flights. All rights reserved.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    console.log("Welcome email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ success: true, message: "Welcome email sent" }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in send-welcome function:", error);
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
