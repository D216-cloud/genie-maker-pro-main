import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";

const benefits = [
  "Sell courses, ebooks, templates",
  "Accept payments instantly",
  "Automated delivery",
  "No technical skills needed",
];

const MonetizationSection = () => {
  return (
    <section id="monetization" className="py-12 sm:py-16 md:py-24 bg-reely-green/5">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-8 sm:gap-10 lg:gap-12 items-center max-w-6xl mx-auto">
          <div className="order-2 lg:order-1">
            <div className="inline-flex items-center gap-2 bg-reely-green/10 text-reely-green px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium mb-4 sm:mb-6">
              Monetization
            </div>
            
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-3 sm:mb-4">
              Drive more revenue
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-2">
              with tools for <span className="text-reely-green font-semibold">monetization</span>
            </p>
            
            <p className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8">
              Sell digital products, services, and subscriptions directly to your audience.
            </p>

            <ul className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
              {benefits.map((benefit) => (
                <li key={benefit} className="flex items-center gap-2 sm:gap-3">
                  <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-reely-green flex-shrink-0" />
                  <span className="text-sm sm:text-base text-foreground">{benefit}</span>
                </li>
              ))}
            </ul>

            <Button variant="cta" size="lg" asChild className="w-full sm:w-auto">
              <Link to="/signup">
                Start Selling Today
              </Link>
            </Button>
          </div>

          <div className="order-1 lg:order-2 relative">
            <div className="relative bg-card rounded-2xl sm:rounded-3xl p-5 sm:p-6 md:p-8 shadow-elevated">
              <div className="aspect-[4/3] sm:aspect-[3/4] bg-gradient-to-br from-reely-green/20 to-primary/20 rounded-xl sm:rounded-2xl flex items-center justify-center">
                <div className="text-center p-4 sm:p-6">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 mx-auto bg-card rounded-xl sm:rounded-2xl shadow-lg flex items-center justify-center mb-3 sm:mb-4">
                    <span className="text-2xl sm:text-3xl md:text-4xl">📱</span>
                  </div>
                  <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-2">
                    Sell Digital Products
                  </h3>
                  <p className="text-sm sm:text-base text-muted-foreground">
                    with ease
                  </p>
                  <div className="mt-4 sm:mt-6 inline-flex items-center gap-2 text-primary font-medium text-sm sm:text-base">
                    <span>Try it →</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Floating card - hidden on mobile */}
            <div className="absolute -bottom-4 sm:-bottom-6 -left-4 sm:-left-6 bg-card rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-elevated animate-float hidden lg:block">
              <div className="flex items-center gap-2 sm:gap-3">
                <span className="text-xl sm:text-2xl">💰</span>
                <div>
                  <p className="text-base sm:text-lg font-bold text-foreground">$12,450</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">This month</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MonetizationSection;
