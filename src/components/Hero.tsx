import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import heroPlane from "@/assets/hero-plane.jpg";

const Hero = () => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !name) {
      toast({
        title: "Missing information",
        description: "Please enter both your name and email",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase
        .from("subscribers")
        .insert([{ email, name }]);

      if (error) {
        if (error.code === "23505") {
          toast({
            title: "Already subscribed!",
            description: "This email is already on our list. Check your inbox for deals!",
          });
        } else {
          throw error;
        }
      } else {
        toast({
          title: "Welcome aboard! ✈️",
          description: "You're now subscribed to exclusive Atlanta flight deals!",
        });
        setEmail("");
        setName("");
      }
    } catch (error) {
      console.error("Subscription error:", error);
      toast({
        title: "Oops!",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src={heroPlane} 
          alt="Airplane flying through blue sky" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/20 via-primary/40 to-background/95" />
      </div>

      {/* Content */}
      <div className="container relative z-10 px-4 py-20 mx-auto text-center">
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20">
            <span className="text-sm font-semibold text-accent">✈️ Atlanta's #1 Flight Deal Newsletter</span>
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-7xl font-bold leading-tight">
            <span className="text-foreground">Cheap Flights from</span>
            <br />
            <span className="bg-gradient-sky bg-clip-text text-transparent">
              Atlanta (ATL)
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
            Get exclusive deals to the world's top destinations delivered straight to your inbox. 
            <span className="font-semibold text-foreground"> Save hundreds on your next adventure.</span>
          </p>

          {/* Email Signup Form */}
          <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-4">
            <div className="flex flex-col sm:flex-row gap-3 p-2 bg-card rounded-xl shadow-xl">
              <Input
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="flex-1 h-14 text-lg border-0 focus-visible:ring-0"
                disabled={isLoading}
              />
              <Input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 h-14 text-lg border-0 focus-visible:ring-0"
                disabled={isLoading}
              />
              <Button 
                type="submit"
                size="lg" 
                className="h-14 px-8 text-lg font-semibold bg-gradient-sunset hover:opacity-90 transition-opacity"
                disabled={isLoading}
              >
                <Mail className="mr-2 h-5 w-5" />
                {isLoading ? "Subscribing..." : "Get Deals"}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Join 5,000+ Atlanta travelers saving on flights. No spam, unsubscribe anytime.
            </p>
          </form>

          {/* Trust Indicators */}
          <div className="flex flex-wrap items-center justify-center gap-8 pt-8 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              <span className="text-muted-foreground">5,000+ Subscribers</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              <span className="text-muted-foreground">50+ Destinations</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              <span className="text-muted-foreground">Daily Price Tracking</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
