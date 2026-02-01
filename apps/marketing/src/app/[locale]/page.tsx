import { setRequestLocale } from "next-intl/server";
import {
  HeroSection,
  ProductionJourneyWithErrorBoundary,
} from "@/components/features/home";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="journey-scroll-container -mt-16 md:-mt-20">
      {/* Hero section - first snap point */}
      <div className="journey-snap-page h-screen w-full">
        <HeroSection />
      </div>
      {/* Production Journey - 8 stages with stacking cards scroll effect */}
      <ProductionJourneyWithErrorBoundary />
    </div>
  );
}
