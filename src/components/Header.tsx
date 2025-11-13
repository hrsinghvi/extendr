import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { ChevronDown, Zap } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-base ${
        isScrolled
          ? "bg-background/80 backdrop-blur-lg border-b border-border shadow-sm"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-8">
            <a href="/" className="flex items-center gap-2 font-bold text-xl">
              <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
                <Zap className="w-5 h-5 text-primary-foreground" />
              </div>
              <span>Bolt</span>
            </a>
            
            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              <a href="#community" className="text-sm font-medium hover:text-primary transition-colors">
                Community
              </a>
              <a href="#enterprise" className="text-sm font-medium hover:text-primary transition-colors">
                Enterprise
              </a>
              <button className="flex items-center gap-1 text-sm font-medium hover:text-primary transition-colors">
                Resources
                <ChevronDown className="w-4 h-4" />
              </button>
              <a href="#careers" className="text-sm font-medium hover:text-primary transition-colors">
                Careers
              </a>
              <a href="#pricing" className="text-sm font-medium hover:text-primary transition-colors">
                Pricing
              </a>
            </nav>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Button variant="ghost" className="hidden sm:inline-flex">
              Sign in
            </Button>
            <Button className="bg-primary hover:bg-primary/90">
              Get started
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
