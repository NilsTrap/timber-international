"use client";

import { useState, useCallback, useRef } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useReducedMotion } from "@/hooks/useReducedMotion";

/**
 * Gallery image type
 */
export type GalleryImage = {
  src: string;
  alt: string;
};

/**
 * Props for HorizontalGallery component
 */
type HorizontalGalleryProps = {
  /** Array of images to display in the gallery */
  images: GalleryImage[];
  /** Show "2 of 6" counter (default: true) */
  showCounter?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Gallery label for accessibility (stage name) */
  galleryLabel?: string;
};

/**
 * HorizontalGallery - A swipeable horizontal image gallery for journey stages.
 *
 * Features:
 * - Touch swipe support on mobile/tablet
 * - Click/drag support on desktop
 * - Left/right arrow navigation
 * - Dot pagination indicators
 * - Keyboard navigation (arrow keys)
 * - Reduced motion support
 * - Full accessibility (ARIA carousel pattern)
 */
export function HorizontalGallery({
  images,
  showCounter = true,
  className = "",
  galleryLabel = "Image gallery",
}: HorizontalGalleryProps) {
  const t = useTranslations("home");
  const reducedMotion = useReducedMotion();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const galleryRef = useRef<HTMLDivElement>(null);

  // Minimum swipe distance to trigger navigation (pixels)
  const minSwipeDistance = 50;

  const goToNext = useCallback(() => {
    if (currentIndex < images.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  }, [currentIndex, images.length]);

  const goToPrevious = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  }, [currentIndex]);

  const goToIndex = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  // Touch handlers for swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0]?.clientX ?? null);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0]?.clientX ?? null);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      goToNext();
    } else if (isRightSwipe) {
      goToPrevious();
    }
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      goToNext();
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      goToPrevious();
    }
  };

  // Don't render gallery controls if only 1 image
  if (images.length <= 1) {
    const singleImage = images[0];
    if (!singleImage) return null;
    return (
      <Image
        src={singleImage.src}
        alt={singleImage.alt}
        fill
        className="object-cover"
        sizes="100vw"
      />
    );
  }

  const isAtStart = currentIndex === 0;
  const isAtEnd = currentIndex === images.length - 1;

  return (
    <div
      ref={galleryRef}
      role="region"
      aria-roledescription="carousel"
      aria-label={galleryLabel}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className={`relative w-full h-full outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 ${className}`}
    >
      {/* Images container */}
      <div className="relative w-full h-full overflow-hidden">
        {images.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 ${
              reducedMotion ? "" : "transition-opacity duration-300 ease-out"
            } ${index === currentIndex ? "opacity-100" : "opacity-0"}`}
            aria-hidden={index !== currentIndex}
          >
            <Image
              src={image.src}
              alt={image.alt}
              fill
              className="object-cover"
              sizes="100vw"
              priority={index === 0}
              unoptimized={image.src.startsWith("http")}
            />
          </div>
        ))}
      </div>

      {/* Screen reader announcement */}
      <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        {t("journey.imageOf", { current: currentIndex + 1, total: images.length })}
      </div>

      {/* Left Arrow */}
      <button
        onClick={goToPrevious}
        disabled={isAtStart}
        aria-label={t("journey.previousImage")}
        className={`absolute left-4 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-black/50 hover:bg-black/70 text-white ${
          reducedMotion ? "" : "transition-all duration-200"
        } ${
          isAtStart
            ? "opacity-0 pointer-events-none"
            : "opacity-100 hover:scale-110"
        } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="w-6 h-6"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.75 19.5L8.25 12l7.5-7.5"
          />
        </svg>
      </button>

      {/* Right Arrow */}
      <button
        onClick={goToNext}
        disabled={isAtEnd}
        aria-label={t("journey.nextImage")}
        className={`absolute right-4 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-black/50 hover:bg-black/70 text-white ${
          reducedMotion ? "" : "transition-all duration-200"
        } ${
          isAtEnd
            ? "opacity-0 pointer-events-none"
            : "opacity-100 hover:scale-110"
        } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="w-6 h-6"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8.25 4.5l7.5 7.5-7.5 7.5"
          />
        </svg>
      </button>

      {/* Counter */}
      {showCounter && (
        <div className="absolute top-4 right-4 z-30 px-3 py-1 rounded-full bg-black/50 text-white text-sm font-medium">
          {t("journey.imageOf", { current: currentIndex + 1, total: images.length })}
        </div>
      )}

      {/* Dot indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex gap-2">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => goToIndex(index)}
            aria-label={t("journey.goToImage", { number: index + 1 })}
            aria-current={index === currentIndex ? "true" : undefined}
            className={`w-2.5 h-2.5 rounded-full ${
              reducedMotion ? "" : "transition-all duration-200"
            } ${
              index === currentIndex
                ? "bg-white scale-110"
                : "bg-white/50 hover:bg-white/75"
            } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black/50`}
          />
        ))}
      </div>
    </div>
  );
}
