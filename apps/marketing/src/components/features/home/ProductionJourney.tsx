"use client";

import { useTranslations } from "next-intl";
import { JourneyStage } from "./JourneyStage";
import { JourneyCompletionCTA } from "./JourneyCompletionCTA";
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

// Substage keys for each stage (used to build gallery with translations)
const STAGE_SUBSTAGES: Record<string, string[]> = {
  forest: ["Growing", "Logging", "Planting"],
  sawmill: ["Selection", "Cutting", "Packing"],
  kilns: ["Loading", "Drying", "Packing"],
  elements: ["Multisaw", "Opticut", "Planing", "FingerJointing", "Gluing", "Calibrating"],
  cnc: ["Machining", "Gluing", "Sanding"],
  finishing: ["Varnishing", "Waxing", "StretchFoiling", "BoxPacking"],
  qualityControl: ["Checking", "Packing"],
  delivery: ["Loading", "Transporting", "Feedback"],
};

/**
 * Production Journey - 8 full-screen stages with stacking cards effect.
 * Uses CSS scroll-snap for reliable section-by-section scrolling.
 * The scroll container is the parent element (page.tsx).
 */
export function ProductionJourney() {
  const t = useTranslations("home");

  return (
    <>
      {/* Journey stages with full-screen backgrounds - stacking cards effect */}
      {STAGE_KEYS.map((stageKey, i) => {
        // Build gallery images with translated substage titles and descriptions
        const substages = STAGE_SUBSTAGES[stageKey] || [];
        const galleryImages: GalleryImage[] = substages.map((substageKey) => ({
          // No src = colored background fallback (images can be added later)
          alt: t(`journey.${stageKey}${substageKey}`),
          title: t(`journey.${stageKey}${substageKey}`),
          description: t(`journey.${stageKey}${substageKey}Description`),
        }));

        return (
          <div key={i + 1} className="journey-snap-page">
            <JourneyStage
              stageNumber={i + 1}
              imageFallback={`/images/journey/${stageKey}.jpg`}
              galleryImages={galleryImages.length > 0 ? galleryImages : undefined}
              headline={t(`journey.${stageKey}`)}
              subtext={t(`journey.${stageKey}Description`)}
              altText={t("journey.stageAlt", {
                number: i + 1,
                name: t(`journey.${stageKey}`),
              })}
              priority={i === 0}
            />
          </div>
        );
      })}

      {/* CTA section after journey completion */}
      <div className="journey-snap-page">
        <JourneyCompletionCTA />
      </div>
    </>
  );
}
