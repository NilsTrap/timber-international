"use client";

import { useTranslations } from "next-intl";
import { useReducedMotion } from "@/hooks/useReducedMotion";

type Props = {
  currentStage: number;
  total: number;
  onStageClick: (stage: number) => void;
};

/**
 * Fixed-position progress indicator for the production journey.
 * Displays dot navigation on the right side of the screen with
 * a counter text below (hidden on mobile).
 */
export function JourneyProgressIndicator({
  currentStage,
  total,
  onStageClick,
}: Props) {
  const t = useTranslations("home");
  const reducedMotion = useReducedMotion();

  return (
    <nav
      className="fixed right-8 top-1/2 -translate-y-1/2 z-20 flex flex-col items-center gap-3"
      aria-label={t("journey.progressNavigation")}
    >
      {/* Dot indicators */}
      <div className="flex flex-col gap-3">
        {Array.from({ length: total }, (_, i) => (
          <button
            key={i + 1}
            onClick={() => onStageClick(i + 1)}
            className={`rounded-full focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-transparent ${
              reducedMotion ? "" : "transition-all duration-300"
            } ${
              currentStage === i + 1
                ? "bg-white w-3 h-3"
                : "bg-white/40 hover:bg-white/60 w-2 h-2"
            }`}
            aria-label={t("journey.goToStage", { number: i + 1 })}
            aria-current={currentStage === i + 1 ? "step" : undefined}
          />
        ))}
      </div>

      {/* Counter text - hidden on mobile */}
      <span className="text-white text-sm hidden md:block mt-2">
        {t("journeyProgress", { current: currentStage || 1, total })}
      </span>
    </nav>
  );
}
