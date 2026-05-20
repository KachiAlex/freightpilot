import React from 'react';
import { Container } from './Container';

interface FooterLink {
  label: string;
  href: string;
}

interface FooterSection {
  title: string;
  links: FooterLink[];
}

interface SocialLink {
  name: string;
  icon: React.ReactNode;
  href: string;
}

interface FooterProps {
  sections?: FooterSection[];
  socialLinks?: SocialLink[];
  copyrightText?: string;
  testId?: string;
}

/**
 * Footer Component
 * 
 * A responsive footer with multiple sections, links, and social media.
 * 
 * Features:
 * - Padding: 64px 24px (desktop), 48px 16px (tablet), 32px 12px (mobile)
 * - Background: #1F2937, white text
 * - 1px top border #374151
 * - 4-column grid (desktop), 2-column (tablet), 1-column (mobile)
 * - Keyboard navigation and focus management
 * - Proper semantic HTML (footer, nav, ul, li, a)
 * 
 * @example
 * <Footer
 *   sections={[
 *     {
 *       title: 'Product',
 *       links: [
 *         { label: 'Features', href: '/features' }
 *       ]
 *     }
 *   ]}
 * />
 */
export const Footer: React.FC<FooterProps> = ({
  sections = [
    {
      title: 'Product',
      links: [
        { label: 'Features', href: '/features' },
        { label: 'Pricing', href: '/pricing' },
        { label: 'Documentation', href: '/docs' },
      ],
    },
    {
      title: 'Company',
      links: [
        { label: 'About', href: '/about' },
        { label: 'Blog', href: '/blog' },
        { label: 'Careers', href: '/careers' },
        { label: 'Contact', href: '/contact' },
      ],
    },
    {
      title: 'Legal',
      links: [
        { label: 'Privacy Policy', href: '/privacy' },
        { label: 'Terms of Service', href: '/terms' },
        { label: 'Compliance', href: '/compliance' },
      ],
    },
  ],
  socialLinks = [
    { name: 'Twitter', icon: '𝕏', href: 'https://twitter.com' },
    { name: 'LinkedIn', icon: 'in', href: 'https://linkedin.com' },
    { name: 'GitHub', icon: '⚙', href: 'https://github.com' },
  ],
  copyrightText = '© 2024 Freightpilot. All rights reserved.',
  testId,
}) => {
  return (
    <footer
      className="bg-[#02040d] text-slate-300 border-t border-white/10"
      data-testid={testId}
    >
      <Container>
        {/* Main Footer Content */}
        <div className="py-16 md:py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
            {sections.map((section, index) => (
              <nav key={index} aria-label={`${section.title} navigation`}>
                <h3 className="text-lg md:text-xl font-semibold text-white mb-4 md:mb-6">
                  {section.title}
                </h3>
                <ul className="space-y-3 md:space-y-4">
                  {section.links.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        className="text-sm md:text-base text-slate-400 hover:text-white transition-colors duration-200 focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky rounded-lg"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="pt-8 md:pt-12 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 md:gap-8">
          {/* Copyright */}
          <p className="text-sm md:text-base text-slate-400">
            {copyrightText}
          </p>

          {/* Social Links */}
          <nav aria-label="Social media links">
            <ul className="flex gap-4 md:gap-6">
              {socialLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    aria-label={link.name}
                    className="w-8 h-8 md:w-10 md:h-10 text-slate-400 hover:text-white transition-colors duration-200 flex items-center justify-center focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky rounded-lg"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {link.icon}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;
