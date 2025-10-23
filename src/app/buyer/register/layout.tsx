import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Buyer Account - Koopi",
  description: "Sign up to shop across all Koopi stores",
};

export default function BuyerRegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}