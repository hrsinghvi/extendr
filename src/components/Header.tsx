import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Zap, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AuthModal } from "./AuthModal";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<"signup" | "login">("signup");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    // Check initial auth state
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Signed out successfully",
      });
      navigate("/");
    }
  };
  return <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-base border-b border-border ${isScrolled ? "backdrop-blur-lg shadow-sm" : "backdrop-blur-lg shadow-sm"}`} style={{backgroundColor: 'rgba(12, 17, 17, 0.6)'}}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center">
            <a href="/" className="flex items-center gap-2 font-bold text-xl">
              <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
                <Zap className="w-5 h-5 text-primary-foreground" />
              </div>
              <span>Bolt</span>
            </a>
          </div>

          {/* Navigation - Centered */}
          <nav className="hidden md:flex items-center gap-6 absolute left-1/2 transform -translate-x-1/2">
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

          {/* Right side */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <Button 
                  variant="ghost" 
                  className="hidden sm:inline-flex" 
                  onClick={() => navigate('/build')}
                >
                  Dashboard
                </Button>
                <Button 
                  variant="ghost"
                  onClick={handleSignOut}
                  className="gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Sign out
                </Button>
              </>
            ) : (
              <>
                <Button 
                  variant="ghost" 
                  className="hidden sm:inline-flex" 
                  onClick={() => {
                    setAuthMode("login");
                    setShowAuthModal(true);
                  }}
                >
                  Sign in
                </Button>
                <Button 
                  className="bg-primary hover:bg-primary/90" 
                  onClick={() => {
                    setAuthMode("signup");
                    setShowAuthModal(true);
                  }}
                >
                  Get started
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
        mode={authMode} 
      />
    </header>;
}