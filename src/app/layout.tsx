import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "react-image-crop/dist/ReactCrop.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { BuyerAuthProvider } from "@/contexts/BuyerAuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { NetworkProvider } from "@/contexts/NetworkContext";
import NetworkLayout from "./NetworkLayout";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Koopi - Create Your Online Store",
  description: "Build and launch your online store in minutes with Koopi. Beautiful themes, easy management, and powerful features.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <BuyerAuthProvider>
            <CartProvider>
              <NetworkProvider>
                <NetworkLayout>{children}</NetworkLayout>
              </NetworkProvider>
            </CartProvider>
          </BuyerAuthProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
