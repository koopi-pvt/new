import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Seller Account - Koopi",
  description: "Sign up and start your online store journey with Koopi",
};

export default function SignupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}