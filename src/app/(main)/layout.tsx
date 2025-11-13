import { Header } from "@/components/layout/header";
import { OnboardingProvider } from "@/components/onboarding/OnboardingProvider";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main className="min-h-screen">{children}</main>
      <OnboardingProvider />
    </>
  );
}
