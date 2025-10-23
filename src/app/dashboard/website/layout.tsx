import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Website Builder - Koopi Dashboard",
  description: "Customize your store website",
};

export default function WebsiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}