import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Zap } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { useNavigate } from "react-router-dom";
export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  return <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-base ${isScrolled ? "bg-background/80 backdrop-blur-lg border-b border-border shadow-sm" : "bg-transparent"}`}>
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
              <button onClick={() => navigate('/features')} className="text-sm font-medium hover:text-primary transition-colors">
                Features
              </button>
              <button className="flex items-center gap-1 text-sm font-medium hover:text-primary transition-colors">
                Resources
                
              </button>
              <button onClick={() => navigate('/pricing')} className="text-sm font-medium hover:text-primary transition-colors">
                Pricing
              </button>
            </nav>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Button variant="ghost" className="hidden sm:inline-flex" onClick={() => navigate('/auth')}>
              Sign in
            </Button>
            <Button className="bg-primary hover:bg-primary/90" onClick={() => navigate('/auth')}>
              Get started
            </Button>
          </div>
        </div>
      </div>
    </header>;
}