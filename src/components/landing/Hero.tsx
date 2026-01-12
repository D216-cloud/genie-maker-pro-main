import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import heroImage from "@/assets/hero-creator.jpg";

const Hero = () => {
  return (
    <section className="pt-20 sm:pt-24 md:pt-32 pb-12 sm:pb-16 md:pb-20 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-4xl mx-auto mb-8 sm:mb-12 animate-fade-in">
          <div className="inline-flex items-center gap-2 bg-reely-blue-light text-primary px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium mb-4 sm:mb-6">
            <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-primary rounded-full animate-pulse" />
            Trusted by 50,000+ creators
          </div>
          
          <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-4 sm:mb-6 px-2">
            The complete creator toolkit{" "}
            <span className="gradient-text">to Grow and Monetize</span>
          </h1>
          
          <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl mx-auto mb-6 sm:mb-8 px-2">
            Automate your Instagram DMs, grow your audience, and sell digital products with ease.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 px-4">
            <Button size="lg" variant="dark" asChild className="w-full sm:w-auto">
              <Link to="/signin">
                Start for Free
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="gap-2 w-full sm:w-auto">
              <Play className="w-4 h-4 sm:w-5 sm:h-5" />
              Watch Demo
            </Button>
          </div>
        </div>

        <div className="relative max-w-5xl mx-auto animate-slide-up animation-delay-200">
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10 pointer-events-none" />
          <div className="relative rounded-xl sm:rounded-2xl md:rounded-3xl overflow-hidden shadow-xl sm:shadow-2xl border border-border/50 mx-2 sm:mx-0">
            <img 
              src={heroImage} 
              alt="ReelyChat creator toolkit dashboard" 
              className="w-full h-auto"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/20" />
          </div>
          
          {/* Floating elements - hidden on mobile */}
          <div className="absolute -top-4 -left-4 md:-left-8 bg-card rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-elevated animate-float hidden lg:block">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-reely-green/20 rounded-full flex items-center justify-center">
                <span className="text-reely-green text-sm sm:text-lg">📈</span>
              </div>
              <div>
                <p className="text-xs sm:text-sm font-semibold text-foreground">+2.4K</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground">New Followers</p>
              </div>
            </div>
          </div>
          
          <div className="absolute -bottom-4 -right-4 md:-right-8 bg-card rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-elevated animate-float animation-delay-300 hidden lg:block">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary/20 rounded-full flex items-center justify-center">
                <span className="text-primary text-sm sm:text-lg">💬</span>
              </div>
              <div>
                <p className="text-xs sm:text-sm font-semibold text-foreground">AutoDM Sent</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground">1,234 messages</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
