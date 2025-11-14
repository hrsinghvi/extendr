import { useState, useEffect } from "react";
import { Button, buttonVariants } from "./ui/button";
import { Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { MobileNav } from "./ui/navbar";
import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";

const navigationLinks = [
    {
        name: 'Menu',
        items: [
            { href: '/features', label: 'Features' },
            { href: '/pricing', label: 'Pricing' },
            { href: '/auth', label: 'About' },
        ],
    },
];

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
          <div className="flex flex-1 items-center justify-start gap-2">
            <MobileNav nav={navigationLinks} />

            <a
              href="/"
              className={cn(
                buttonVariants({ variant: 'ghost', size: 'icon' }),
                "text-white hover:bg-transparent"
              )}
            >
              <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
                <Zap className="w-5 h-5 text-primary-foreground" />
              </div>
            </a>
          </div>

          <NavigationMenu className="max-md:hidden">
            <NavigationMenuList>
              {navigationLinks[0].items.map((link, index) => (
                <NavigationMenuItem key={index}>
                  <NavigationMenuLink
                    asChild
                    href={link.href}
                    className="rounded-md px-3 py-1.5 font-medium text-white hover:text-primary transition-colors"
                  >
                    <a onClick={(e) => {
                      e.preventDefault();
                      navigate(link.href);
                    }}>{link.label}</a>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>

          <div className="flex flex-1 items-center justify-end gap-2">
            <Button 
              variant="ghost" 
              className="hidden sm:inline-flex text-white hover:bg-white/10"
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
          </div>
        </div>
      </div>
    </header>
  );
}
