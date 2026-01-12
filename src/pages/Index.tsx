import Header from "@/components/landing/Header";
import Hero from "@/components/landing/Hero";
import TrustBar from "@/components/landing/TrustBar";
import FeaturesSection from "@/components/landing/FeaturesSection";
import MonetizationSection from "@/components/landing/MonetizationSection";
import IntegrationsSection from "@/components/landing/IntegrationsSection";
import TestimonialsSection from "@/components/landing/TestimonialsSection";
import CTASection from "@/components/landing/CTASection";
import Footer from "@/components/landing/Footer";

const Index = () => {
  return (
    <div>
      <Header />
      <main className="pt-16">
        <Hero />
        <TrustBar />
        <FeaturesSection />
        <MonetizationSection />
        <IntegrationsSection />
        <TestimonialsSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
