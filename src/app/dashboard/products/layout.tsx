import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Products - Koopi Dashboard",
  description: "Manage your store products",
};

export default function ProductsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}