import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <HomeContent />;
}

function HomeContent() {
  const t = useTranslations("home");

  return (
    <div className="container mx-auto px-4 py-16">
      <section className="text-center">
        <h1 className="text-4xl font-bold md:text-5xl lg:text-6xl">
          {t("heroSlogan")}
        </h1>
        <p className="mt-6 text-lg text-muted-foreground md:text-xl">
          {t("heroDescription")}
        </p>
      </section>
    </div>
  );
}
