import { setRequestLocale } from "next-intl/server";
import { HeroSection, ProductionJourney } from "@/components/features/home";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="snap-y snap-mandatory">
      {/* Negative margin to offset layout padding and make hero full-screen */}
      <div className="-mt-16 md:-mt-20 snap-start snap-always">
        <HeroSection />
      </div>

      {/* Production Journey - 8 stages scroll container */}
      <ProductionJourney />
    </div>
  );
}
