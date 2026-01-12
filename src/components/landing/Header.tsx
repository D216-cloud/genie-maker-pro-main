import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import badgeLogo from "@/assets/logos/reelychat-mascot-badge.svg";

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
      <div className="container mx-auto px-4 h-14 sm:h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 flex-shrink-0" aria-label="ReelyChat home">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
            <img src={badgeLogo} alt="ReelyChat logo" className="w-6 h-6 sm:w-7 sm:h-7" />
          </div>
          <span className="text-lg sm:text-xl font-bold text-foreground">ReelyChat</span>
        </Link>
        
        <nav className="hidden md:flex items-center gap-6 lg:gap-8">
          <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Features
          </a>
          <a href="#monetization" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Monetization
          </a>
          <a href="#integrations" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Integrations
          </a>
          <a href="#testimonials" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Testimonials
          </a>
        </nav>

        <div className="hidden sm:flex items-center gap-2 sm:gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/signin">Sign In</Link>
          </Button>
          <Button size="sm" asChild>
            <Link to="/signin">Get Started</Link>
          </Button>
        </div>

        {/* Mobile menu button */}
        <Button
          variant="ghost"
          size="icon"
          className="sm:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden bg-background border-b border-border animate-fade-in">
          <div className="container mx-auto px-4 py-4 space-y-4">
            <nav className="flex flex-col gap-3">
              <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors" onClick={() => setMobileMenuOpen(false)}>
                Features
              </a>
              <a href="#monetization" className="text-sm text-muted-foreground hover:text-foreground transition-colors" onClick={() => setMobileMenuOpen(false)}>
                Monetization
              </a>
              <a href="#integrations" className="text-sm text-muted-foreground hover:text-foreground transition-colors" onClick={() => setMobileMenuOpen(false)}>
                Integrations
              </a>
              <a href="#testimonials" className="text-sm text-muted-foreground hover:text-foreground transition-colors" onClick={() => setMobileMenuOpen(false)}>
                Testimonials
              </a>
            </nav>
            <div className="flex flex-col gap-2 pt-2 border-t border-border">
              <Button variant="ghost" size="sm" asChild className="w-full justify-center">
                <Link to="/signin" onClick={() => setMobileMenuOpen(false)}>Sign In</Link>
              </Button>
              <Button size="sm" asChild className="w-full justify-center">
                <Link to="/signin" onClick={() => setMobileMenuOpen(false)}>Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
