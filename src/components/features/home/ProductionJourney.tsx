"use client";

import { useCallback } from "react";
import { useTranslations } from "next-intl";
import { useJourneyProgress } from "@/hooks/useJourneyProgress";
import { JourneyProgressIndicator } from "./JourneyProgressIndicator";
import { useReducedMotion } from "@/hooks/useReducedMotion";

// Placeholder colors for each stage - will be replaced by actual stage content in Story 2-3
const STAGE_COLORS = [
  "bg-[#1B4332]", // Forest - forest-500
  "bg-amber-700", // Sawmill
  "bg-orange-600", // Kilns
  "bg-[#8B5A2B]", // Elements/Panels - oak-500
  "bg-slate-600", // CNC
  "bg-emerald-600", // Finishing
  "bg-blue-600", // Quality Control
  "bg-green-700", // Delivery
];

// Translation keys for stage names
const STAGE_KEYS = [
  "forest",
  "sawmill",
  "kilns",
  "elements",
  "cnc",
  "finishing",
  "qualityControl",
  "delivery",
] as const;

/**
 * Production Journey scroll container with 8 full-screen stages.
 * Uses CSS scroll-snap for section-by-section scrolling.
 * Includes keyboard navigation (ArrowUp/ArrowDown) and progress indicator.
 */
export function ProductionJourney() {
  const t = useTranslations("home");
  const { currentStage, containerRef } = useJourneyProgress();
  const reducedMotion = useReducedMotion();

  const scrollToStage = useCallback(
    (stageNum: number) => {
      const stage = document.getElementById(`stage-${stageNum}`);
      if (stage) {
        stage.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth" });
      }
    },
    [reducedMotion]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown" && currentStage < 8) {
      e.preventDefault();
      scrollToStage(currentStage + 1);
    }
    if (e.key === "ArrowUp" && currentStage > 1) {
      e.preventDefault();
      scrollToStage(currentStage - 1);
    }
  };

  return (
    <section
      ref={containerRef as React.RefObject<HTMLElement>}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className="relative outline-none scroll-smooth"
      role="region"
      aria-label={t("journey.progressNavigation")}
    >
      {/* Screen reader announcement for stage changes */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {currentStage > 0 &&
          t("journey.stageOf", { current: currentStage, total: 8 }) +
            ": " +
            t(`journey.${STAGE_KEYS[currentStage - 1]}`)}
      </div>

      <JourneyProgressIndicator
        currentStage={currentStage}
        total={8}
        onStageClick={scrollToStage}
      />

      {/* Placeholder stage sections - will be replaced by JourneyStage components in Story 2-3 */}
      {Array.from({ length: 8 }, (_, i) => (
        <div
          key={i + 1}
          data-stage={i + 1}
          id={`stage-${i + 1}`}
          className={`h-screen w-full flex flex-col items-center justify-center snap-start snap-always ${STAGE_COLORS[i]}`}
        >
          <span className="text-white/60 text-lg mb-4">
            {t("journey.stageOf", { current: i + 1, total: 8 })}
          </span>
          <h2 className="text-4xl md:text-6xl lg:text-7xl text-white font-heading font-bold text-center">
            {t(`journey.${STAGE_KEYS[i]}`)}
          </h2>
        </div>
      ))}
    </section>
  );
}
