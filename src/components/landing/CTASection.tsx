import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const CTASection = () => {
  return (
    <section className="py-12 sm:py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 sm:mb-6">
            Try ReelyChat today
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-6 sm:mb-8">
            The all-in-one toolkit to monetize
          </p>
          
          <Button variant="pill-dark" size="lg" asChild className="w-full sm:w-auto">
            <Link to="/signin">
              Get Started Free
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
