import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Mail, CheckCircle2 } from "lucide-react";

const Unsubscribe = () => {
  const [email, setEmail] = useState("");
  const [feedback, setFeedback] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isUnsubscribed, setIsUnsubscribed] = useState(false);
  const { toast } = useToast();

  const handleUnsubscribe = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast({
        title: "Email required",
        description: "Please enter your email address",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Update subscriber status to inactive
      const { data, error } = await supabase
        .from("subscribers")
        .update({ is_active: false })
        .eq("email", email)
        .select();

      if (error) throw error;

      if (!data || data.length === 0) {
        toast({
          title: "Email not found",
          description: "We couldn't find that email in our subscriber list.",
          variant: "destructive",
        });
        return;
      }

      // Log feedback if provided (you could store this in a feedback table)
      if (feedback) {
        console.log("Unsubscribe feedback from", email, ":", feedback);
        // You could add a database table for feedback here
      }

      setIsUnsubscribed(true);
      toast({
        title: "Successfully unsubscribed",
        description: "You've been removed from our mailing list.",
      });
    } catch (error) {
      console.error("Unsubscribe error:", error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isUnsubscribed) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-card rounded-2xl shadow-xl p-8 text-center">
          <CheckCircle2 className="h-16 w-16 mx-auto text-accent mb-4" />
          <h1 className="text-3xl font-bold text-foreground mb-4">
            You've been unsubscribed
          </h1>
          <p className="text-muted-foreground mb-6">
            We're sorry to see you go! You won't receive any more emails from us.
          </p>
          <p className="text-sm text-muted-foreground mb-6">
            Changed your mind? You can always resubscribe on our homepage.
          </p>
          <Button
            onClick={() => window.location.href = "/"}
            className="bg-gradient-sunset"
          >
            Back to Homepage
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-card rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <Mail className="h-12 w-12 mx-auto text-primary mb-4" />
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Unsubscribe
          </h1>
          <p className="text-muted-foreground">
            We're sorry to see you go. Enter your email below to unsubscribe from our flight deal alerts.
          </p>
        </div>

        <form onSubmit={handleUnsubscribe} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
              Email Address
            </label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              required
              className="w-full"
            />
          </div>

          <div>
            <label htmlFor="feedback" className="block text-sm font-medium text-foreground mb-2">
              Help us improve (optional)
            </label>
            <Textarea
              id="feedback"
              placeholder="Why are you unsubscribing? We'd love to hear your feedback."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              disabled={isLoading}
              rows={4}
              className="w-full resize-none"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Your feedback helps us improve our service for other travelers.
            </p>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-destructive hover:bg-destructive/90 text-destructive-foreground"
          >
            {isLoading ? "Processing..." : "Unsubscribe"}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Want to pause emails instead?{" "}
            <a href="/" className="text-primary hover:underline">
              Contact us
            </a>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Unsubscribe;
