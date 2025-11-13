'use client';

import { useEffect, useState } from 'react';
import { OnboardingTour } from './OnboardingTour';

export function OnboardingProvider() {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    // Get user from localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setUserId(userData.id);
    }
  }, []);

  if (!userId) {
    return null;
  }

  return <OnboardingTour userId={userId} />;
}
