import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Buyer Login - Koopi",
  description: "Login to your Koopi buyer account",
};

export default function BuyerLoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}