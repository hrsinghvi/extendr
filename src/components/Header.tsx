import { useState } from "react";
import { LogOut, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator
} from "./ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { useCredits } from "@/hooks/useCredits";
import { useSubscription } from "@/hooks/useSubscription";
import {
  Navbar,
  NavBody,
  NavItems,
  MobileNav,
  NavbarLogo,
  NavbarButton,
  MobileNavHeader,
  MobileNavToggle,
  MobileNavMenu,
} from "@/components/ui/resizable-navbar";

export function Header() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, session, isAuthenticated, isLoading, signOut } = useAuth();
  const { credits, totalAvailable } = useCredits();
  const { planName } = useSubscription();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  /**
   * Handle sign out
   */
  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed out",
        description: "You've been signed out successfully.",
      });
      navigate("/");
      setIsMobileMenuOpen(false);
    } catch {
      // Error already handled
    }
  };

  // Derive user display info from user or session
  const account = user ?? session?.user ?? null;
  const userEmail = account?.email ?? "";
  const userName = account?.user_metadata?.full_name 
    || account?.user_metadata?.name 
    || (userEmail ? userEmail.split("@")[0] : "User");
  const userAvatar = account?.user_metadata?.avatar_url 
    || account?.user_metadata?.picture 
    || null;
  const userInitial = userName.charAt(0).toUpperCase() || "U";

  const navItems = [
    {
      name: "Features",
      link: "/features",
      onClick: () => navigate("/features"),
    },
    {
      name: "Resources",
      link: "#", // Placeholder
      onClick: () => {},
    },
    {
      name: "Pricing",
      link: "/pricing",
      onClick: () => navigate("/pricing"),
    },
  ];

  return (
    <div className="relative w-full">
      <Navbar>
        {/* Desktop Navigation */}
        <NavBody>
          <div className="flex items-center gap-4 relative z-50">
             <NavbarLogo />
          </div>
         
          <NavItems items={navItems} />
          
          <div className="flex items-center gap-3 relative z-50">
            {isLoading ? (
              // Loading state - skeleton avatar
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-md bg-gray-700 animate-pulse" />
                <div className="hidden sm:block w-20 h-4 rounded bg-gray-700 animate-pulse" />
              </div>
            ) : isAuthenticated ? (
              // Authenticated - profile dropdown
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-3 focus:outline-none rounded-md px-2 py-1 transition-colors hover:bg-white/10">
                    {userAvatar ? (
                      <img 
                        src={userAvatar} 
                        alt={userName}
                        className="w-8 h-8 rounded-md object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center text-sm font-semibold text-primary-foreground">
                        {userInitial}
                      </div>
                    )}
                    <span className="text-base font-bold text-white hidden sm:block">
                      {userName}
                    </span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  sideOffset={8} 
                  className="w-60 z-[100] bg-[#232323] text-white border border-[#3a3a3a] rounded-lg shadow-lg p-2"
                >
                  {/* User info header */}
                  <div className="flex items-center gap-3 px-3 py-2">
                    {userAvatar ? (
                      <img 
                        src={userAvatar} 
                        alt={userName}
                        className="w-9 h-9 rounded-md object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-md bg-primary flex items-center justify-center text-sm font-semibold text-primary-foreground">
                        {userInitial}
                      </div>
                    )}
                    <div className="overflow-hidden">
                      <p className="text-sm font-semibold leading-none truncate">{userName}</p>
                      <p className="text-xs text-gray-400 leading-none truncate mt-1">{userEmail}</p>
                    </div>
                  </div>

                  {/* Plan & Credits indicator */}
                  <div className="px-3 py-2 border border-[#3a3a3a] rounded-md bg-[#1a1a1a] my-2">
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="text-gray-400">Plan</span>
                      <span className="font-semibold capitalize text-white">{planName}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-medium">Credits</span>
                      <span className="font-medium">{totalAvailable} left</span>
                    </div>
                    <div className="h-1.5 w-full bg-[#3a3a3a] rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-[#5A9665] transition-all duration-300" 
                        style={{ 
                          width: credits 
                            ? `${Math.min(100, (totalAvailable / (credits.dailyTotal + credits.monthlyTotal || 1)) * 100)}%` 
                            : '0%' 
                        }} 
                      />
                    </div>
                  </div>

                  {/* Menu items */}
                  <DropdownMenuItem 
                    onSelect={() => navigate('/settings')} 
                    className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-[#2f2f2f] rounded-md"
                  >
                    <Settings className="w-4 h-4" />
                    <span className="text-sm">Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="my-1 bg-[#3a3a3a] h-px" />
                  <DropdownMenuItem 
                    onSelect={handleSignOut} 
                    className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-[#2f2f2f] rounded-md"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="text-sm">Sign out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              // Not authenticated - sign in buttons
              <>
                <NavbarButton
                  variant="ghost"
                  className="hidden sm:inline-block text-neutral-300 hover:text-white"
                  onClick={() => navigate('/auth')}
                >
                  Sign in
                </NavbarButton>
                <NavbarButton
                  variant="primary"
                  onClick={() => navigate('/auth', { state: { isSignUp: true } })}
                >
                  Get started
                </NavbarButton>
              </>
            )}
          </div>
        </NavBody>

        {/* Mobile Navigation */}
        <MobileNav>
          <MobileNavHeader>
            <NavbarLogo />
            <MobileNavToggle
              isOpen={isMobileMenuOpen}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            />
          </MobileNavHeader>

          <MobileNavMenu
            isOpen={isMobileMenuOpen}
            onClose={() => setIsMobileMenuOpen(false)}
          >
            {navItems.map((item, idx) => (
              <a
                key={`mobile-link-${idx}`}
                href={item.link}
                onClick={(e) => {
                  e.preventDefault();
                  setIsMobileMenuOpen(false);
                  item.onClick();
                }}
                className="relative text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white"
              >
                <span className="block text-lg font-medium">{item.name}</span>
              </a>
            ))}
            
            <div className="w-full h-px bg-gray-200 dark:bg-gray-800 my-2" />
            
            {isAuthenticated ? (
              <div className="flex flex-col gap-4 w-full">
                 <div className="flex items-center gap-3">
                    {userAvatar ? (
                      <img 
                        src={userAvatar} 
                        alt={userName}
                        className="w-8 h-8 rounded-md object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center text-sm font-semibold text-primary-foreground">
                        {userInitial}
                      </div>
                    )}
                    <span className="text-sm font-medium text-neutral-900 dark:text-white">
                      {userName}
                    </span>
                 </div>
                 <NavbarButton
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      navigate('/settings');
                    }}
                    variant="secondary"
                    className="w-full justify-start px-0"
                  >
                    Settings
                  </NavbarButton>
                  <NavbarButton
                    onClick={() => {
                      handleSignOut();
                    }}
                    variant="secondary"
                    className="w-full justify-start px-0 text-red-500 hover:text-red-600"
                  >
                    Sign out
                  </NavbarButton>
              </div>
            ) : (
              <div className="flex w-full flex-col gap-4">
                <NavbarButton
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    navigate('/auth');
                  }}
                  variant="secondary"
                  className="w-full border border-gray-200 dark:border-gray-800"
                >
                  Sign in
                </NavbarButton>
                <NavbarButton
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    navigate('/auth', { state: { isSignUp: true } });
                  }}
                  variant="primary"
                  className="w-full"
                >
                  Get started
                </NavbarButton>
              </div>
            )}
          </MobileNavMenu>
        </MobileNav>
      </Navbar>
    </div>
  );
}
