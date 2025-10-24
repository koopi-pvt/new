import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Seller Login - Koopi",
  description: "Login to your Koopi seller account and manage your online store",
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}