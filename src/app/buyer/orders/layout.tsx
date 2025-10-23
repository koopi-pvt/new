import { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Orders - Koopi",
  description: "View and track your orders from Koopi stores",
};

export default function BuyerOrdersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
