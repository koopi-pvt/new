import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Orders - Koopi Dashboard",
  description: "Manage your store orders",
};

export default function OrdersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}