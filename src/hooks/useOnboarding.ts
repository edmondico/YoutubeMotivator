'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useAuth } from '@/components/AuthProvider';

export const useOnboarding = () => {
  const [needsOnboarding, setNeedsOnboarding] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (!user) {
        setNeedsOnboarding(null);
        setIsLoading(false);
        return;
      }

      // Temporary fix: disable onboarding check to break infinite loop
      // Skip database check due to 406 errors and infinite loops
      console.log('Onboarding check temporarily disabled');
      setNeedsOnboarding(false);
      setIsLoading(false);
      return;

      /* Commented out to prevent infinite loops
      try {
        const { data: goals, error } = await supabase
          .from('user_goals')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error checking user goals:', error);
          setNeedsOnboarding(true);
        } else if (!goals) {
          setNeedsOnboarding(true);
        } else {
          setNeedsOnboarding(false);
        }
      } catch (error) {
        console.error('Error in onboarding check:', error);
        setNeedsOnboarding(true);
      } finally {
        setIsLoading(false);
      }
      */
    };

    checkOnboardingStatus();
  }, [user?.id]);

  const redirectToOnboarding = () => {
    router.push('/onboarding');
  };

  const completeOnboarding = () => {
    setNeedsOnboarding(false);
  };

  return {
    needsOnboarding,
    isLoading,
    redirectToOnboarding,
    completeOnboarding
  };
};