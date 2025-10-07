import Hero from "@/components/Hero";
import RecentDeals from "@/components/RecentDeals";
import HowItWorks from "@/components/HowItWorks";
import SocialProof from "@/components/SocialProof";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <main className="min-h-screen bg-background">
      <Hero />
      <RecentDeals />
      <HowItWorks />
      <SocialProof />
      <Footer />
    </main>
  );
};

export default Index;
