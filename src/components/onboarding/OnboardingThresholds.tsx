import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { ArrowRight, ArrowLeft, Sparkles, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import type { SelectedDestination } from '@/pages/Onboarding';

interface OnboardingThresholdsProps {
  selectedDestinations: SelectedDestination[];
  onNext: (destinations: SelectedDestination[]) => void;
  onBack: () => void;
}

export const OnboardingThresholds = ({ selectedDestinations, onNext, onBack }: OnboardingThresholdsProps) => {
  const [destinations, setDestinations] = useState(selectedDestinations);
  const [loadingAI, setLoadingAI] = useState(false);
  const [aiRecommendations, setAiRecommendations] = useState<Record<string, { threshold: number; reasoning: string; confidence: string }>>({});
  const { toast } = useToast();

  useEffect(() => {
    // Automatically get AI recommendations when component mounts
    getAIRecommendations();
  }, []);

  const updateThreshold = (id: string, threshold: number) => {
    setDestinations(prev => 
      prev.map(dest => dest.id === id ? { ...dest, threshold } : dest)
    );
  };

  const getAIRecommendations = async () => {
    setLoadingAI(true);
    const recommendations: Record<string, { threshold: number; reasoning: string; confidence: string }> = {};

    try {
      // Get AI recommendations for all destinations in parallel
      const promises = destinations.map(async (dest) => {
        try {
          const { data, error } = await supabase.functions.invoke('recommend-threshold', {
            body: { destination_id: dest.id }
          });

          if (error) throw error;

          return {
            id: dest.id,
            threshold: data.recommended_threshold,
            reasoning: data.reasoning,
            confidence: data.confidence,
          };
        } catch (err) {
          console.error(`Failed to get AI recommendation for ${dest.city_name}:`, err);
          return {
            id: dest.id,
            threshold: Math.round((dest.average_price || 500) * 0.75),
            reasoning: 'Using default calculation (75% of average price)',
            confidence: 'low',
          };
        }
      });

      const results = await Promise.all(promises);
      
      results.forEach(result => {
        recommendations[result.id] = {
          threshold: result.threshold,
          reasoning: result.reasoning,
          confidence: result.confidence,
        };
      });

      setAiRecommendations(recommendations);

      // Auto-apply AI recommendations
      setDestinations(prev =>
        prev.map(dest => ({
          ...dest,
          threshold: recommendations[dest.id]?.threshold || dest.threshold
        }))
      );

      toast({
        title: '✨ AI Recommendations Ready',
        description: 'Smart thresholds calculated based on historical price patterns',
      });
    } catch (error) {
      console.error('Error getting AI recommendations:', error);
      toast({
        title: 'Using default thresholds',
        description: 'AI recommendations unavailable, using smart defaults',
        variant: 'destructive',
      });
      // Fallback to simple calculation
      setDestinations(prev =>
        prev.map(dest => ({
          ...dest,
          threshold: Math.round((dest.average_price || 500) * 0.75)
        }))
      );
    } finally {
      setLoadingAI(false);
    }
  };

  return (
    <div className="min-h-screen p-4 py-8">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Set your price alerts</CardTitle>
            <CardDescription className="text-lg">
              We'll notify you when prices drop below these thresholds
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">AI-Optimized Thresholds</span>
              </div>
              <Button onClick={getAIRecommendations} variant="outline" size="sm" disabled={loadingAI}>
                {loadingAI ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Recalculate AI Thresholds
                  </>
                )}
              </Button>
            </div>

            <div className="space-y-4 max-h-[500px] overflow-y-auto">
              {destinations.map(dest => {
                const avgPrice = dest.average_price || 500;
                const minPrice = Math.round(avgPrice * 0.5);
                const maxPrice = Math.round(avgPrice * 1.5);
                
                const aiRec = aiRecommendations[dest.id];
                
                return (
                  <div key={dest.id} className="p-4 rounded-lg border bg-card">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-lg">
                            {dest.city_name}, {dest.country}
                          </h3>
                          {aiRec && (
                            <Badge variant={aiRec.confidence === 'high' ? 'default' : 'secondary'} className="text-xs">
                              <Sparkles className="h-3 w-3 mr-1" />
                              AI {aiRec.confidence}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Average price: ${Math.round(avgPrice)}
                        </p>
                        {aiRec && (
                          <p className="text-xs text-muted-foreground mt-1 italic">
                            {aiRec.reasoning}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground mb-1">Alert when below:</div>
                        <Input
                          type="number"
                          value={dest.threshold}
                          onChange={(e) => updateThreshold(dest.id, parseInt(e.target.value) || 0)}
                          className="w-32 text-lg font-semibold"
                          min={minPrice}
                          max={maxPrice}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Slider
                        value={[dest.threshold]}
                        onValueChange={([value]) => updateThreshold(dest.id, value)}
                        min={minPrice}
                        max={maxPrice}
                        step={10}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>${minPrice}</span>
                        <span>${maxPrice}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Progress */}
            <div className="flex items-center justify-center gap-2 pt-4">
              <div className="h-2 w-2 rounded-full bg-primary"></div>
              <div className="h-2 w-2 rounded-full bg-primary"></div>
              <div className="h-2 w-2 rounded-full bg-primary"></div>
            </div>
            <p className="text-sm text-muted-foreground text-center">Step 3 of 3</p>
          </CardContent>
          
          <CardFooter className="justify-between">
            <Button onClick={onBack} variant="outline" className="gap-2">
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
            <Button onClick={() => onNext(destinations)} className="gap-2">
              Finish Setup <ArrowRight className="h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};
