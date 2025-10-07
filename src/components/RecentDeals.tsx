import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Plane, TrendingDown } from "lucide-react";

interface Deal {
  id: string;
  price: number;
  dates: string;
  destination: {
    city_name: string;
    country: string;
    airport_code: string;
  };
}

const RecentDeals = () => {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDeals = async () => {
      try {
        const { data, error } = await supabase
          .from("price_alerts")
          .select(`
            id,
            price,
            dates,
            destination:destinations (
              city_name,
              country,
              airport_code
            )
          `)
          .order("received_at", { ascending: false })
          .limit(6);

        if (error) throw error;
        setDeals(data as Deal[]);
      } catch (error) {
        console.error("Error fetching deals:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDeals();
  }, []);

  if (isLoading) {
    return (
      <section className="py-20 px-4 bg-secondary/30">
        <div className="container mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12">Loading deals...</h2>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 px-4 bg-secondary/30">
      <div className="container mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20">
            <TrendingDown className="w-4 h-4 text-accent" />
            <span className="text-sm font-semibold text-accent">Recent Deals</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold">
            Latest Flight Deals from Atlanta
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Real deals sent to our subscribers. Don't miss out on your next adventure!
          </p>
        </div>

        {/* Deals Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {deals.map((deal, index) => (
            <Card 
              key={deal.id} 
              className="group p-6 hover:shadow-deal transition-all duration-300 hover:-translate-y-1 border-2 hover:border-accent/30 animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Destination */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors">
                    {deal.destination?.city_name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {deal.destination?.country} ({deal.destination?.airport_code})
                  </p>
                </div>
                <Plane className="w-6 h-6 text-primary group-hover:rotate-45 transition-transform duration-300" />
              </div>

              {/* Price */}
              <div className="mb-4">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold bg-gradient-sunset bg-clip-text text-transparent">
                    ${deal.price}
                  </span>
                  <span className="text-lg text-muted-foreground">roundtrip</span>
                </div>
              </div>

              {/* Dates */}
              <div className="pt-4 border-t border-border">
                <p className="text-sm text-muted-foreground">
                  Travel Dates: <span className="font-semibold text-foreground">{deal.dates}</span>
                </p>
              </div>

              {/* Deal Badge */}
              <div className="mt-4">
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-semibold">
                  <TrendingDown className="w-3 h-3" />
                  Great Deal
                </span>
              </div>
            </Card>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <p className="text-lg text-muted-foreground">
            These deals were sent to our subscribers. 
            <a href="#subscribe" className="ml-2 font-semibold text-primary hover:underline">
              Subscribe now to get the next one →
            </a>
          </p>
        </div>
      </div>
    </section>
  );
};

export default RecentDeals;
