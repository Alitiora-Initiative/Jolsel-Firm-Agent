import { Hero } from "@/components/Hero";
import { Header } from "@/components/Header";
import { Departments } from "@/components/Departments";
import { Architecture } from "@/components/Architecture";
import { Pipeline } from "@/components/Pipeline";
import { Stack } from "@/components/Stack";
import { Footer } from "@/components/Footer";
import { WhitepaperSection } from "@/components/WhitepaperSection";
import Whitepaper from "@/app/whitepaper";
import { Header } from "@/components/Header";

export default function Home() {
  return (
    <main className="relative overflow-hidden">
      <Header />
      <Hero />
      <Departments />
      <Pipeline />
      <Architecture />
      <Stack />
      <WhitepaperSection />
      <Footer />
    </main>
  );
}