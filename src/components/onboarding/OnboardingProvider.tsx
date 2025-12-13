"use client";

import { useEffect, useState } from "react";
import { WelcomeTour } from "./WelcomeTour";

export function OnboardingProvider() {
  const [runTour, setRunTour] = useState(false);

  useEffect(() => {
    // Check if tour was already completed
    const completed = localStorage.getItem("welcomeTourCompleted");

    if (!completed) {
      // Give user a moment to see the page before showing tour
      const timer = setTimeout(() => {
        setRunTour(true);
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, []);

  return <WelcomeTour run={runTour} onFinish={() => setRunTour(false)} />;
}
