import { Navbar } from "@/components/navbar";
import { Hero } from "@/components/landing/Hero";
import { ValueProposition } from "@/components/landing/ValueProposition";
import { FeatureGrid } from "@/components/landing/FeatureGrid";
import { ProductShowcase } from "@/components/landing/ProductShowcase";
import { Pricing } from "@/components/landing/Pricing";
import { Faq } from "@/components/landing/Faq";
import { LandingBackground } from "@/components/landing/LandingBackground";
import { ScrollProgress } from "@/components/landing/ScrollProgress";

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
