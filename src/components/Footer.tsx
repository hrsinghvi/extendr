import { MessageCircle, Linkedin, Youtube, Twitter, Instagram, Circle, ArrowUpRight } from "lucide-react";

const footerLinks = {
  Resources: [
    { label: "Support", href: "#support" },
    { label: "Blog", href: "#blog" },
    { label: "Gallery", href: "#gallery" },
    { label: "Status", href: "#status" },
  ],
  Company: [
    { label: "Careers", href: "#careers" },
    { label: "Privacy", href: "#privacy" },
    { label: "Terms", href: "#terms" },
  ],
};

const socialLinks = [
  { icon: MessageCircle, href: "#", label: "Discord" },
  { icon: Linkedin, href: "#", label: "LinkedIn" },
  { icon: Youtube, href: "#", label: "YouTube" },
  { icon: Twitter, href: "#", label: "Twitter/X" },
  { icon: Instagram, href: "#", label: "Instagram" },
  { icon: Circle, href: "#", label: "Reddit" },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-[#232323] mt-72">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand column */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <img src="/logo.svg" alt="extendr" className="w-10 h-10 rounded-lg" />
              <span className="font-bold text-lg">extendr</span>
            </div>
          </div>

          {/* Links columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="font-semibold mb-4 text-foreground">{category}</h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1 group"
                    >
                      {link.label}
                      <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Social column */}
          <div>
            <h3 className="font-semibold mb-4 text-foreground">Social</h3>
            <ul className="space-y-3">
              {socialLinks.map((social) => (
                <li key={social.label}>
                  <a
                    href={social.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-2"
                  >
                    <social.icon className="w-4 h-4" />
                    {social.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-border">
          <p className="text-sm text-muted-foreground text-center">
            © 2025 extendr - All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
