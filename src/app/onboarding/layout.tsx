import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Get Started - Koopi",
  description: "Set up your store and start selling in minutes",
};

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}