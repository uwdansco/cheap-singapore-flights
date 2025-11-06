import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface SubscriptionStatus {
  isActive: boolean;
  isGrandfathered: boolean;
  isTrialing: boolean;
  planType: 'monthly' | 'annual' | 'grandfathered' | null;
  trialEndsAt: string | null;
  currentPeriodEnd: string | null;
  status: string | null;
  loading: boolean;
}

export const useSubscription = () => {
  const [subscription, setSubscription] = useState<SubscriptionStatus>({
    isActive: false,
    isGrandfathered: false,
    isTrialing: false,
    planType: null,
    trialEndsAt: null,
    currentPeriodEnd: null,
    status: null,
    loading: true,
  });

  const checkSubscription = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setSubscription({
          isActive: false,
          isGrandfathered: false,
          isTrialing: false,
          planType: null,
          trialEndsAt: null,
          currentPeriodEnd: null,
          status: null,
          loading: false,
        });
        return;
      }

      const { data, error } = await supabase.functions.invoke('check-subscription');
      
      if (error) throw error;

      setSubscription({
        ...data,
        loading: false,
      });
    } catch (error) {
      console.error('Error checking subscription:', error);
      setSubscription(prev => ({ ...prev, loading: false }));
    }
  };

  useEffect(() => {
    checkSubscription();

    const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(() => {
      checkSubscription();
    });

    return () => {
      authSubscription.unsubscribe();
    };
  }, []);

  return { ...subscription, refetch: checkSubscription };
};
