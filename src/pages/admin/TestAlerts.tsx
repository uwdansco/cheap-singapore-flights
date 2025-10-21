import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Send, RefreshCw, Target } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const TestAlerts = () => {
  const [isTriggeringPriceCheck, setIsTriggeringPriceCheck] = useState(false);
  const [isProcessingQueue, setIsProcessingQueue] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [emailQueueStats, setEmailQueueStats] = useState<any>(null);
  const [priceComparisonData, setPriceComparisonData] = useState<any[]>([]);

  const handleTriggerPriceCheck = async () => {
    try {
      setIsTriggeringPriceCheck(true);
      setResults(null);
      
      toast.info("Starting price check... This may take a few minutes");
      
      const { data, error } = await supabase.functions.invoke('check-flight-prices');

      if (error) throw error;

      setResults(data);
      toast.success(`Price check complete! ${data.alertsTriggered || 0} alerts triggered`);
      
      // Refresh data
      await Promise.all([fetchEmailQueueStats(), fetchPriceComparison()]);
    } catch (error: any) {
      console.error('Error triggering price check:', error);
      toast.error(`Failed to trigger price check: ${error.message}`);
    } finally {
      setIsTriggeringPriceCheck(false);
    }
  };

  const handleProcessEmailQueue = async () => {
    try {
      setIsProcessingQueue(true);
      
      toast.info("Processing email queue...");
      
      const { data, error } = await supabase.functions.invoke('process-email-queue');

      if (error) throw error;

      toast.success(`Email queue processed! ${data.emailsSent || 0} emails sent`);
      
      await fetchEmailQueueStats();
    } catch (error: any) {
      console.error('Error processing email queue:', error);
      toast.error(`Failed to process email queue: ${error.message}`);
    } finally {
      setIsProcessingQueue(false);
    }
  };

  const fetchEmailQueueStats = async () => {
    try {
      const { count: pendingCount } = await supabase
        .from('email_queue')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      const { count: sentCount } = await supabase
        .from('email_queue')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'sent');

      const { count: failedCount } = await supabase
        .from('email_queue')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'failed');

      setEmailQueueStats({
        pending: pendingCount || 0,
        sent: sentCount || 0,
        failed: failedCount || 0,
      });
    } catch (error) {
      console.error('Error fetching email queue stats:', error);
    }
  };

  const fetchPriceComparison = async () => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      const { data: compData, error: compError } = await supabase
        .from('user_destinations')
        .select(`
          price_threshold,
          destinations (
            city_name,
            airport_code,
            id
          )
        `)
        .eq('is_active', true);

      if (!compError && compData) {
        const enriched = await Promise.all(
          compData.map(async (item: any) => {
            const dest = item.destinations;
            
            const { data: priceData } = await supabase
              .from('price_history')
              .select('price, checked_at')
              .eq('destination_id', dest.id)
              .order('checked_at', { ascending: false })
              .limit(1)
              .maybeSingle();

            const { data: statsData } = await supabase
              .from('price_statistics')
              .select('avg_90day, total_samples')
              .eq('destination_id', dest.id)
              .maybeSingle();

            const latest_price = priceData?.price;
            const alert_status = !latest_price 
              ? 'No price data'
              : latest_price <= item.price_threshold
                ? '✅ TRIGGER'
                : '❌ Above threshold';

            return {
              city_name: dest.city_name,
              airport_code: dest.airport_code,
              price_threshold: item.price_threshold,
              latest_price,
              checked_at: priceData?.checked_at,
              avg_90day: statsData?.avg_90day,
              total_samples: statsData?.total_samples || 0,
              alert_status
            };
          })
        );
        
        setPriceComparisonData(enriched);
      }
    } catch (error) {
      console.error('Error fetching price comparison:', error);
    }
  };

  useEffect(() => {
    fetchEmailQueueStats();
    fetchPriceComparison();
  }, []);

  return (
    <div className="container mx-auto p-6 max-w-6xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Test Alert System</h1>
        <p className="text-muted-foreground mt-2">
          Manually trigger price checks and email processing to test the alert system
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Price Check</CardTitle>
            <CardDescription>
              Check flight prices for all active destinations and trigger alerts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={handleTriggerPriceCheck}
              disabled={isTriggeringPriceCheck}
              className="w-full"
            >
              {isTriggeringPriceCheck ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Checking Prices...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Run Price Check
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Email Queue</CardTitle>
            <CardDescription>
              Process pending emails in the queue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={handleProcessEmailQueue}
              disabled={isProcessingQueue}
              className="w-full"
            >
              {isProcessingQueue ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Process Email Queue
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Price Comparison Table */}
      {priceComparisonData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Price vs Threshold Comparison
            </CardTitle>
            <CardDescription>
              Current prices compared to your alert thresholds
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Destination</th>
                    <th className="text-right p-2">Latest Price</th>
                    <th className="text-right p-2">Your Threshold</th>
                    <th className="text-right p-2">90-Day Avg</th>
                    <th className="text-center p-2">Samples</th>
                    <th className="text-center p-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {priceComparisonData.map((row: any, index: number) => (
                    <tr key={index} className="border-b hover:bg-muted/50">
                      <td className="p-2 font-medium">
                        {row.city_name} ({row.airport_code})
                      </td>
                      <td className="p-2 text-right">
                        {row.latest_price ? `$${row.latest_price}` : '-'}
                      </td>
                      <td className="p-2 text-right font-semibold text-primary">
                        ${row.price_threshold}
                      </td>
                      <td className="p-2 text-right text-muted-foreground">
                        {row.avg_90day ? `$${parseFloat(row.avg_90day).toFixed(0)}` : '-'}
                      </td>
                      <td className="p-2 text-center text-muted-foreground">
                        {row.total_samples}
                      </td>
                      <td className="p-2 text-center">
                        <span className={
                          row.alert_status.includes('✅') 
                            ? 'text-green-600 font-semibold' 
                            : row.alert_status.includes('❌')
                              ? 'text-red-600'
                              : 'text-muted-foreground'
                        }>
                          {row.alert_status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 text-sm text-muted-foreground">
              <p><strong>Note:</strong> Alerts are only triggered when:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Current price is <strong>below</strong> your threshold</li>
                <li>Deal quality meets minimum requirements (default: "good")</li>
                <li>Cooldown period has passed (default: 7 days)</li>
                <li>At least 7 price samples exist for the destination</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      {emailQueueStats && (
        <Card>
          <CardHeader>
            <CardTitle>Email Queue Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-yellow-600">{emailQueueStats.pending}</div>
                <div className="text-sm text-muted-foreground">Pending</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{emailQueueStats.sent}</div>
                <div className="text-sm text-muted-foreground">Sent</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">{emailQueueStats.failed}</div>
                <div className="text-sm text-muted-foreground">Failed</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {results && (
        <Card>
          <CardHeader>
            <CardTitle>Price Check Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertDescription>
                <div className="space-y-2">
                  <div>✅ <strong>{results.destinationsChecked}</strong> destinations checked</div>
                  <div>🔔 <strong>{results.alertsTriggered}</strong> alerts triggered</div>
                </div>
              </AlertDescription>
            </Alert>

            {results.results && results.results.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-semibold">Price Details:</h4>
                <div className="space-y-1 max-h-96 overflow-y-auto">
                  {results.results.map((result: any, index: number) => (
                    <div key={index} className="text-sm p-2 bg-muted rounded">
                      {result.error ? (
                        <div className="text-destructive">
                          ❌ {result.destination}: {result.error}
                        </div>
                      ) : (
                        <div>
                          <span className="font-medium">{result.destination}</span>: 
                          ${result.price} 
                          {result.quality && (
                            <span className="ml-2 text-xs px-2 py-1 bg-primary/10 rounded">
                              {result.quality}
                            </span>
                          )}
                          {result.savings !== undefined && (
                            <span className={`ml-2 ${result.savings > 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {result.savings}% {result.savings > 0 ? 'savings' : 'above avg'}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>How It Works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div>
            <strong>1. Price Check:</strong> Runs every 2 hours via cron job. Fetches current prices from Amadeus API.
          </div>
          <div>
            <strong>2. Alert Criteria:</strong> Price must be below threshold, meet quality level, have 7+ samples, and respect cooldown.
          </div>
          <div>
            <strong>3. Email Queue:</strong> Alerts are added to queue, then processed every 5 minutes by cron job.
          </div>
          <div>
            <strong>4. Recommendations:</strong> Set thresholds above current average prices to receive test alerts.
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TestAlerts;
