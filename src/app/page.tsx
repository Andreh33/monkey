import { Hero } from "@/components/home/Hero";
import { ServicesSplit } from "@/components/home/ServicesSplit";
import { FeaturedScooters } from "@/components/home/FeaturedScooters";
import { RepairProcess } from "@/components/home/RepairProcess";
import { RepairTypesBento } from "@/components/home/RepairTypesBento";
import { BrandsTicker } from "@/components/home/BrandsTicker";
import { TikTokSection } from "@/components/home/TikTokSection";
import { TestimonialsCarousel } from "@/components/home/TestimonialsCarousel";
import { CtaBanner } from "@/components/home/CtaBanner";
import MonkeyWalkerLoader from "@/components/layout/MonkeyWalkerLoader";

export default function HomePage() {
  return (
    <>
      <MonkeyWalkerLoader />
      <Hero />
      <ServicesSplit />
      <FeaturedScooters />
      <RepairProcess />
      <RepairTypesBento />
      <BrandsTicker />
      <TikTokSection />
      <TestimonialsCarousel />
      <CtaBanner />
    </>
  );
}
