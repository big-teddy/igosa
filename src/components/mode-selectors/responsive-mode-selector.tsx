"use client";

import { useEffect, useState } from "react";
import { ToggleSwitch } from "./toggle-switch";
import { SegmentedControl } from "./segmented-control";

interface ResponsiveModeSelectorProps {
  mode: "price" | "recommend";
  onModeChange: (mode: "price" | "recommend") => void;
}

export function ResponsiveModeSelector({ mode, onModeChange }: ResponsiveModeSelectorProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if screen is mobile on mount
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <>
      {/* Desktop: Segmented Control */}
      <div className="hidden md:block">
        <SegmentedControl mode={mode} onModeChange={onModeChange} />
      </div>

      {/* Mobile: Toggle Switch */}
      <div className="block md:hidden">
        <ToggleSwitch mode={mode} onModeChange={onModeChange} />
      </div>
    </>
  );
}
