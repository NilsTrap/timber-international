import { TopNav } from "@/components/layout/TopNav";

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}
