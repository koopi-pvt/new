'use client';

import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Features } from "@/components/Features";
import { CTA } from "@/components/CTA";
import { Footer } from "@/components/Footer";
import { Pricing } from "@/components/Pricing";
import { ProOfferPopup } from "@/components/ProOfferPopup";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      <ProOfferPopup />
      <Header />
      <Hero />
      <Features />
      <Pricing />
      <CTA />
      <Footer />
    </div>
  );
}
