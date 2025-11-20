import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Zap, LogOut, Settings, HelpCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator
} from "./ui/dropdown-menu";
import { AuthModal } from "./AuthModal";
import { useToast } from "@/hooks/use-toast";

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<"signup" | "login">("signup");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);
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
      setUser(session?.user || null);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
      setUser(session?.user || null);
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

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-base border-b border-border ${isScrolled ? "backdrop-blur-lg shadow-sm" : "backdrop-blur-lg shadow-sm"}`} style={{ backgroundColor: 'rgba(35, 35, 35, 0.6)' }}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo & Brand */}
            <div className="flex items-center">
              <button onClick={() => navigate('/')} className="flex items-center gap-2 font-bold text-xl focus:outline-none hover:opacity-80 transition-opacity">
                <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
                  <Zap className="w-5 h-5 text-primary-foreground" />
                </div>
                <span>Bolt</span>
              </button>
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
              {isAuthenticated && user ? (
                // Authenticated user - show profile with dropdown
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-3 focus:outline-none rounded-md px-2 py-1 transition-colors hover:bg-white/10">
                      <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center text-sm font-semibold text-primary-foreground">
                        {user.email?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <span className="text-sm font-medium text-white hidden sm:block">
                        {user.email?.split('@')[0] || 'User'}
                      </span>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent sideOffset={8} className="w-60 bg-[#0C1111] text-white border border-[#2a2a2a] rounded-lg shadow-lg p-2">
                    {/* Header */}
                    <div className="flex items-center gap-3 px-3 py-2">
                      <div className="w-9 h-9 rounded-md bg-primary flex items-center justify-center text-sm font-semibold text-primary-foreground">
                        {user.email?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div>
                        <p className="text-sm font-semibold leading-none truncate max-w-[150px]">{user.email?.split('@')[0] || 'User'}</p>
                        <p className="text-xs text-gray-400 leading-none truncate max-w-[150px]">{user.email}</p>
                      </div>
                    </div>

                    {/* Credits */}
                    <div className="px-3 py-2 border border-[#2a2a2a] rounded-md bg-[#161B1B] my-2">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-medium">Credits</span>
                        <span className="font-medium">5 left</span>
                      </div>
                      <div className="h-1.5 w-full bg-[#2a2a2a] rounded-full overflow-hidden">
                        <div className="h-full bg-violet-500" style={{ width: '60%' }} />
                      </div>
                    </div>

                    {/* Menu items */}
                    <DropdownMenuItem onSelect={() => navigate('/settings')} className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-[#1a1a1a] rounded-md">
                      <Settings className="w-4 h-4" /> <span className="text-sm">Settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => navigate('/help')} className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-[#1a1a1a] rounded-md">
                      <HelpCircle className="w-4 h-4" /> <span className="text-sm">Help Center</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="my-1 bg-[#2a2a2a] h-px" />
                    <DropdownMenuItem onSelect={handleSignOut} className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-[#1a1a1a] rounded-md">
                      <LogOut className="w-4 h-4" /> <span className="text-sm">Sign out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                // Not authenticated - show login buttons
                <>
                  <Button
                    variant="ghost"
                    className="hidden sm:inline-flex"
                    onClick={() => navigate('/auth')}
                  >
                    Sign in
                  </Button>
                  <Button
                    className="bg-primary hover:bg-primary/90"
                    onClick={() => navigate('/auth')}
                  >
                    Get started
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        mode={authMode}
      />
    </>
  );
}