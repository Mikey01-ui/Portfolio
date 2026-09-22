import { HeroScene } from "@/components/hero-scene";
import { SecurityProtection } from "@/components/SecurityProtection";

export default function Home() {
  return (
    <main className="min-h-svh overflow-x-clip bg-black">
      <SecurityProtection />
      <HeroScene />
    </main>
  );
}
