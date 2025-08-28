'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import OnboardingFlow from '@/components/OnboardingFlow';
import { OnboardingGoals } from '@/types';

export default function OnboardingPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [hasGoals, setHasGoals] = useState(false);
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    const checkUserGoals = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push('/');
          return;
        }

        // Check if user already has goals set
        const { data: goals } = await supabase
          .from('user_goals')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (goals) {
          setHasGoals(true);
          router.push('/'); // Redirect to main app if goals already exist
          return;
        }
      } catch (error) {
        console.error('Error checking user goals:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkUserGoals();
  }, [router, supabase]);

  const handleOnboardingComplete = (goals: OnboardingGoals) => {
    router.push('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (hasGoals) {
    return null; // Will redirect
  }

  return <OnboardingFlow onComplete={handleOnboardingComplete} />;
}