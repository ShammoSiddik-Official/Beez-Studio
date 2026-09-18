import { Link } from "wouter";
import { SiFacebook, SiInstagram, SiX } from "react-icons/si";
import { Linkedin, Code2 } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-secondary text-secondary-foreground pt-20 pb-10 border-t border-border">
      <div className="container mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="md:col-span-1">
            <Link href="/" className="inline-block mb-6">
              <img
                src="/beez-studio-logo.png"
                alt="Beez Studio"
                className="h-14 w-auto brightness-0 invert"
              />
            </Link>
            <p className="text-muted-foreground max-w-xs leading-relaxed mb-6">
              Building Bangladesh's future, one landmark at a time. Since 2007.
            </p>
            <div className="flex items-center gap-4 text-muted-foreground">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className="hover:text-primary transition-colors"
                aria-label="Facebook"
              >
                <SiFacebook size={20} />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="hover:text-primary transition-colors"
                aria-label="Instagram"
              >
                <SiInstagram size={20} />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                className="hover:text-primary transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin size={20} />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                className="hover:text-primary transition-colors"
                aria-label="X / Twitter"
              >
                <SiX size={18} />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-serif font-semibold text-lg mb-6">Studio</h4>
            <ul className="space-y-4">
              <li>
                <Link
                  href="/about"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/projects"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Portfolio
                </Link>
              </li>
              <li>
                <Link
                  href="/services"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Services
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-serif font-semibold text-lg mb-6">Services</h4>
            <ul className="space-y-4 text-muted-foreground">
              <li>Architecture & Planning</li>
              <li>Interior Design</li>
              <li>Construction Management</li>
              <li>Industrial Construction</li>
              <li>Landscape Design</li>
              <li>Religious Architecture</li>
            </ul>
          </div>

          <div>
            <h4 className="font-serif font-semibold text-lg mb-6">Contact</h4>
            <ul className="space-y-4 text-muted-foreground text-sm leading-relaxed">
              <li>
                F-109, H-41/B, R-01
                <br />
                Dhanmondi R/A, Dhaka-1205
                <br />
                Bangladesh
              </li>
              <li>
                +8801711178066
                <br />
                Fax: +880244612330
              </li>
              <li>
                <a
                  href="mailto:info.beezstudio@gmail.com"
                  className="hover:text-primary transition-colors"
                >
                  info.beezstudio@gmail.com
                </a>
              </li>
              <li>
                <a
                  href="http://www.beezstudio.com.bd"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-primary transition-colors"
                >
                  www.beezstudio.com.bd
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-border space-y-3">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm text-muted-foreground">
            <p>
              &copy; 2026 BeeZ Studio. Architectural Consultancy & Construction.
              All rights reserved.
            </p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <Link href="#" className="hover:text-primary transition-colors">
                Privacy Policy
              </Link>
              <Link href="#" className="hover:text-primary transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
          {/* Developer Credit */}
          <div className="flex items-center justify-center gap-2 pt-2 text-xs text-muted-foreground/50">
            <Code2 size={13} className="text-primary/40" />
            <span>
              Designed & developed by{" "}
              <span className="text-primary/70 font-medium hover:text-primary transition-colors cursor-default">
                Shammo Siddik
              </span>{" "}
              — Ai & Full Stack Developer , BeeZ Studio
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
