import { Hero } from "@/components/Hero";
import { Departments } from "@/components/Departments";
import { Architecture } from "@/components/Architecture";
import { Stack } from "@/components/Stack";
import { Pipeline } from "@/components/Pipeline";
import { Footer } from "@/components/Footer";
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
      <Footer />
    </main>
  );
}
