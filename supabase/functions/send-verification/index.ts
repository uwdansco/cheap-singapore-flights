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

interface VerificationRequest {
  email: string;
  name: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, name }: VerificationRequest = await req.json();

    console.log("Processing verification request for:", email);

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: "Invalid email format" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Create Supabase client with service role
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Generate verification token
    const verificationToken = crypto.randomUUID();

    // Check if email already exists
    const { data: existing } = await supabase
      .from("subscribers")
      .select("id, is_verified")
      .eq("email", email)
      .single();

    if (existing) {
      if (existing.is_verified) {
        return new Response(
          JSON.stringify({ error: "Email already subscribed and verified" }),
          { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      } else {
        // Resend verification email
        const { error: updateError } = await supabase
          .from("subscribers")
          .update({ verification_token: verificationToken })
          .eq("id", existing.id);

        if (updateError) throw updateError;
      }
    } else {
      // Insert new subscriber
      const { error: insertError } = await supabase
        .from("subscribers")
        .insert([{
          email,
          name,
          verification_token: verificationToken,
          is_verified: false,
          is_active: false
        }]);

      if (insertError) throw insertError;
    }

    // Get site URL from environment or use default
    const siteUrl = Deno.env.get("SITE_URL") || "https://cheapatlantaflights.com";
    const verificationUrl = `${siteUrl}/verify?token=${verificationToken}`;

    // Send verification email
    const emailResponse = await resend.emails.send({
      from: "Cheap Atlanta Flights <onboarding@resend.dev>",
      to: [email],
      subject: "Confirm your subscription to Atlanta Flight Deals",
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
                font-size: 32px;
                margin-bottom: 10px;
              }
              h1 {
                color: #1e40af;
                font-size: 28px;
                margin: 0 0 20px 0;
              }
              .button {
                display: inline-block;
                padding: 16px 32px;
                background: linear-gradient(135deg, #f97316 0%, #fb923c 100%);
                color: #ffffff;
                text-decoration: none;
                border-radius: 8px;
                font-weight: 600;
                font-size: 16px;
                margin: 20px 0;
              }
              .button:hover {
                opacity: 0.9;
              }
              .benefits {
                background-color: #f0f9ff;
                border-left: 4px solid #3b82f6;
                padding: 20px;
                margin: 20px 0;
                border-radius: 4px;
              }
              .benefits h2 {
                margin-top: 0;
                color: #1e40af;
                font-size: 18px;
              }
              .benefits ul {
                margin: 10px 0;
                padding-left: 20px;
              }
              .benefits li {
                margin: 8px 0;
              }
              .footer {
                text-align: center;
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #e5e7eb;
                color: #6b7280;
                font-size: 14px;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <div class="logo">✈️</div>
                <h1>Welcome to Cheap Atlanta Flights!</h1>
              </div>
              
              <p>Hi ${name},</p>
              
              <p>Thank you for subscribing to our exclusive flight deal alerts from Atlanta (ATL)! You're just one click away from accessing incredible flight deals.</p>
              
              <p style="text-align: center;">
                <a href="${verificationUrl}" class="button">Confirm Your Subscription</a>
              </p>
              
              <div class="benefits">
                <h2>What you'll get:</h2>
                <ul>
                  <li>✈️ Daily flight deal alerts from Atlanta to amazing destinations</li>
                  <li>💰 Save hundreds of dollars on international flights</li>
                  <li>🌍 Discover deals to 50+ destinations worldwide</li>
                  <li>⚡ Be the first to know about mistake fares and flash sales</li>
                  <li>📧 Carefully curated deals, no spam</li>
                </ul>
              </div>
              
              <p><strong>Important:</strong> Click the button above to verify your email address. This link will expire in 24 hours.</p>
              
              <p>If the button doesn't work, copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #3b82f6;">${verificationUrl}</p>
              
              <div class="footer">
                <p>If you didn't sign up for this newsletter, you can safely ignore this email.</p>
                <p>© ${new Date().getFullYear()} Cheap Atlanta Flights. All rights reserved.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    console.log("Verification email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ success: true, message: "Verification email sent" }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in send-verification function:", error);
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
