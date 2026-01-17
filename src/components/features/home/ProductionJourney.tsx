"use client";

import { useCallback } from "react";
import { useTranslations } from "next-intl";
import { useJourneyProgress } from "@/hooks/useJourneyProgress";
import { JourneyStage } from "./JourneyStage";
import { JourneyCompletionCTA } from "./JourneyCompletionCTA";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import type { GalleryImage } from "./HorizontalGallery";

// Translation keys for stage names (matches i18n keys in messages/*.json)
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

// Gallery images for stages that have multiple images
// Stages with galleries: Sawmill (2), Elements (4), CNC (5), Finishing (6)
const STAGE_GALLERY_IMAGES: Record<string, GalleryImage[]> = {
  sawmill: [
    { src: "https://placehold.co/1920x1080/8B4513/FFFFFF?text=Sawmill+2", alt: "Sawmill cutting operation" },
    { src: "https://placehold.co/1920x1080/8B4513/FFFFFF?text=Sawmill+3", alt: "Sawmill machinery" },
    { src: "https://placehold.co/1920x1080/8B4513/FFFFFF?text=Sawmill+4", alt: "Sawmill precision cutting" },
  ],
  elements: [
    { src: "https://placehold.co/1920x1080/DEB887/333333?text=Elements+2", alt: "Panel selection process" },
    { src: "https://placehold.co/1920x1080/DEB887/333333?text=Elements+3", alt: "Color sorting elements" },
    { src: "https://placehold.co/1920x1080/DEB887/333333?text=Elements+4", alt: "Quality inspection" },
  ],
  cnc: [
    { src: "https://placehold.co/1920x1080/4A4A4A/FFFFFF?text=CNC+2", alt: "CNC milling operation" },
    { src: "https://placehold.co/1920x1080/4A4A4A/FFFFFF?text=CNC+3", alt: "CNC precision routing" },
    { src: "https://placehold.co/1920x1080/4A4A4A/FFFFFF?text=CNC+4", alt: "CNC finished piece" },
  ],
  finishing: [
    { src: "https://placehold.co/1920x1080/CD853F/FFFFFF?text=Finishing+2", alt: "Varnishing process" },
    { src: "https://placehold.co/1920x1080/CD853F/FFFFFF?text=Finishing+3", alt: "Waxing application" },
    { src: "https://placehold.co/1920x1080/CD853F/FFFFFF?text=Finishing+4", alt: "Final polish" },
  ],
};

/**
 * Production Journey scroll container with 8 full-screen stages.
 * Uses CSS scroll-snap for section-by-section scrolling.
 * Includes keyboard navigation (ArrowUp/ArrowDown).
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

      {/* Journey stages with full-screen backgrounds */}
      {STAGE_KEYS.map((stageKey, i) => (
        <JourneyStage
          key={i + 1}
          stageNumber={i + 1}
          imageFallback={`/images/journey/${stageKey}.jpg`}
          galleryImages={STAGE_GALLERY_IMAGES[stageKey]}
          headline={t(`journey.${stageKey}`)}
          subtext={t(`journey.${stageKey}Description`)}
          altText={t("journey.stageAlt", {
            number: i + 1,
            name: t(`journey.${stageKey}`),
          })}
          priority={i === 0}
        />
      ))}

      {/* CTA section after journey completion */}
      <JourneyCompletionCTA />
    </section>
  );
}
