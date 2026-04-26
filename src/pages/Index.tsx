import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import FilterBar from "@/components/FilterBar";
import CaseStudies from "@/components/CaseStudies";
import Services from "@/components/Services";
import ConversionCTA from "@/components/ConversionCTA";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <main className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <Navbar />
      <Hero />
      <FilterBar />
      <CaseStudies />
      <Services />
      <ConversionCTA />
      <Footer />
    </main>
  );
};

export default Index;
