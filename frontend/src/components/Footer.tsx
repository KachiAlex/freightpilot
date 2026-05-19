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
      className="bg-neutral-800 text-neutral-white border-t border-neutral-700"
      data-testid={testId}
    >
      <Container>
        {/* Main Footer Content */}
        <div className="py-2xl mobile:py-2xl tablet:py-3xl desktop:py-4xl">
          <div className="grid grid-cols-1 tablet:grid-cols-2 desktop:grid-cols-3 gap-sm mobile:gap-sm tablet:gap-md desktop:gap-2xl">
            {sections.map((section, index) => (
              <nav key={index} aria-label={`${section.title} navigation`}>
                <h3 className="text-h3 font-semibold text-neutral-white mb-md mobile:mb-md tablet:mb-lg desktop:mb-lg">
                  {section.title}
                </h3>
                <ul className="space-y-sm mobile:space-y-sm tablet:space-y-md desktop:space-y-md">
                  {section.links.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        className="text-body_sm text-neutral-medium hover:text-neutral-white transition-colors duration-200 focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-blue rounded-sm"
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
        <div className="pt-sm mobile:pt-sm tablet:pt-md desktop:pt-2xl border-t border-neutral-700 flex flex-col mobile:flex-col tablet:flex-row desktop:flex-row justify-between items-center gap-sm mobile:gap-sm tablet:gap-md desktop:gap-md">
          {/* Copyright */}
          <p className="text-body_sm text-neutral-medium">
            {copyrightText}
          </p>

          {/* Social Links */}
          <nav aria-label="Social media links">
            <ul className="flex gap-sm mobile:gap-sm tablet:gap-md desktop:gap-md">
              {socialLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    aria-label={link.name}
                    className="w-5 h-5 text-neutral-medium hover:text-neutral-white transition-colors duration-200 flex items-center justify-center focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-blue rounded-sm"
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
