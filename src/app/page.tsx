import { Navbar } from "@/components/layout/navbar";
import { Hero } from "@/features/landing/components/Hero";
import { ValueProposition } from "@/features/landing/components/ValueProposition";
import { FeatureGrid } from "@/features/landing/components/FeatureGrid";
import { ProductShowcase } from "@/features/landing/components/ProductShowcase";
import { Pricing } from "@/features/landing/components/Pricing";
import { Faq } from "@/features/landing/components/Faq";
import { LandingBackground } from "@/features/landing/components/LandingBackground";
import { ScrollProgress } from "@/features/landing/components/ScrollProgress";

export default function Home() {
  return (
    <div className="relative isolate flex flex-1 flex-col overflow-x-clip bg-background">
      <LandingBackground />
      <Navbar />
      <ScrollProgress />
      <main className="relative z-10 flex flex-1 flex-col">
        <Hero />
        <ValueProposition />
        <FeatureGrid />
        <ProductShowcase />
        <Pricing />
        <Faq />
      </main>
    </div>
  );
}
