import { Header } from "@/components/layout/header";
import { OnboardingProvider } from "@/components/onboarding/OnboardingProvider";
import { ErrorBoundary } from "@/components/ErrorBoundary";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ErrorBoundary>
      <Header />
      <main className="min-h-screen">{children}</main>
      <OnboardingProvider />
    </ErrorBoundary>
  );
}
