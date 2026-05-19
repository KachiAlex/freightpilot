import React, { useState, useRef, useEffect } from 'react';
import { Button } from './Button';
import { useKeyboardNavigation } from '../hooks/useKeyboardNavigation';

interface NavigationProps {
  testId?: string;
}

/**
 * Navigation Component
 * 
 * A responsive navigation bar with desktop horizontal layout and mobile hamburger menu.
 * 
 * Features:
 * - Desktop: 72px height, flexbox layout with space-between
 * - Logo: 32px height (desktop), 28px (mobile), left-aligned with 24px margin
 * - Navigation links: 16px font, weight 500, 24px spacing
 * - Hover state: color #0066FF with 200ms transition
 * - Active state: 2px underline #0066FF
 * - Sign In button: secondary style, Launch App button: primary style
 * - Fixed position at top with z-index 1000, white background with 1px bottom border
 * - Mobile hamburger menu with full-screen overlay
 * - Keyboard navigation and focus management
 * - Escape key closes mobile menu
 * - Focus trap in mobile menu
 * - Logical tab order through all interactive elements
 * 
 * @example
 * <Navigation />
 */
export const Navigation: React.FC<NavigationProps> = ({ testId }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const hamburgerRef = useRef<HTMLButtonElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  // Use keyboard navigation hook for mobile menu
  const { containerRef: focusTrapRef } = useKeyboardNavigation({
    onEscape: () => {
      setIsMenuOpen(false);
      hamburgerRef.current?.focus();
    },
    trapFocus: true,
    isOpen: isMenuOpen,
  });

  // Close menu when Escape key is pressed (fallback for older browsers)
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMenuOpen) {
        setIsMenuOpen(false);
        hamburgerRef.current?.focus();
      }
    };

    if (isMenuOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        hamburgerRef.current &&
        !hamburgerRef.current.contains(e.target as Node)
      ) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  const navLinks = [
    { label: 'Product', href: '#product' },
    { label: 'Workflow', href: '#workflow' },
    { label: 'Compliance', href: '#compliance' },
  ];

  return (
    <div
      className="fixed top-0 left-0 right-0 z-1000 bg-neutral-white border-b border-neutral-border"
      data-testid={testId}
    >
      {/* Desktop Navigation */}
      <nav className="hidden desktop:flex h-72 items-center justify-between px-lg" aria-label="Main navigation">
        {/* Logo */}
        <div className="flex items-center">
          <a
            href="/"
            className="text-h3 font-bold text-neutral-dark hover:text-primary-blue transition-colors duration-200 focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-blue rounded-sm"
            aria-label="Freightpilot Home"
          >
            Freightpilot
          </a>
        </div>

        {/* Desktop Navigation Links */}
        <div className="flex items-center gap-lg" role="menubar">
          {navLinks.map((link, index) => (
            <a
              key={link.label}
              href={link.href}
              className="text-body font-medium text-neutral-dark hover:text-primary-blue transition-colors duration-200 pb-1 hover:border-b-2 hover:border-primary-blue focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-blue rounded-sm"
              role="menuitem"
              tabIndex={index === 0 ? 0 : -1}
              onKeyDown={(e) => {
                // Arrow key navigation for desktop menu
                if (e.key === 'ArrowRight') {
                  e.preventDefault();
                  const nextLink = e.currentTarget.parentElement?.querySelector(
                    `a[role="menuitem"]:nth-child(${index + 2})`
                  ) as HTMLElement;
                  nextLink?.focus();
                } else if (e.key === 'ArrowLeft') {
                  e.preventDefault();
                  const prevLink = e.currentTarget.parentElement?.querySelector(
                    `a[role="menuitem"]:nth-child(${index})`
                  ) as HTMLElement;
                  prevLink?.focus();
                } else if (e.key === 'Home') {
                  e.preventDefault();
                  const firstLink = e.currentTarget.parentElement?.querySelector(
                    'a[role="menuitem"]:first-child'
                  ) as HTMLElement;
                  firstLink?.focus();
                } else if (e.key === 'End') {
                  e.preventDefault();
                  const lastLink = e.currentTarget.parentElement?.querySelector(
                    'a[role="menuitem"]:last-child'
                  ) as HTMLElement;
                  lastLink?.focus();
                }
              }}
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-md">
          <Button
            variant="secondary"
            size="regular"
            onClick={() => {}}
            aria-label="Sign In"
          >
            Sign In
          </Button>
          <Button
            variant="primary"
            size="regular"
            onClick={() => {}}
            aria-label="Launch App"
          >
            Launch App
          </Button>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <nav className="desktop:hidden h-64 flex items-center justify-between px-sm" aria-label="Main navigation">
        {/* Logo */}
        <a
          href="/"
          className="text-h3 font-bold text-neutral-dark focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-blue rounded-sm"
          aria-label="Freightpilot Home"
        >
          Freightpilot
        </a>

        {/* Hamburger Menu Button */}
        <button
          ref={hamburgerRef}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="w-11 h-11 flex items-center justify-center rounded-md hover:bg-neutral-light transition-colors duration-200 focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-blue"
          aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={isMenuOpen}
          aria-controls="mobile-menu"
        >
          <div className="w-6 h-6 flex flex-col justify-center items-center gap-1">
            <span
              className={`w-6 h-0.5 bg-neutral-dark transition-all duration-300 ${
                isMenuOpen ? 'rotate-45 translate-y-2' : ''
              }`}
            />
            <span
              className={`w-6 h-0.5 bg-neutral-dark transition-all duration-300 ${
                isMenuOpen ? 'opacity-0' : ''
              }`}
            />
            <span
              className={`w-6 h-0.5 bg-neutral-dark transition-all duration-300 ${
                isMenuOpen ? '-rotate-45 -translate-y-2' : ''
              }`}
            />
          </div>
        </button>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <nav
          className="fixed inset-0 top-64 bg-neutral-white z-999 desktop:hidden"
          id="mobile-menu"
          ref={(el) => {
            menuRef.current = el;
            if (el) focusTrapRef.current = el;
          }}
          aria-label="Mobile navigation menu"
        >
          <div className="flex flex-col h-full">
            {/* Mobile Navigation Links */}
            <div className="flex-1 flex flex-col p-sm gap-sm">
              {navLinks.map((link, index) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-body font-medium text-neutral-dark hover:text-primary-blue transition-colors duration-200 py-md px-md rounded-md hover:bg-neutral-light focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-blue"
                  onClick={() => setIsMenuOpen(false)}
                  tabIndex={isMenuOpen ? 0 : -1}
                  onKeyDown={(e) => {
                    // Arrow key navigation for mobile menu
                    if (e.key === 'ArrowDown') {
                      e.preventDefault();
                      const nextLink = e.currentTarget.parentElement?.querySelector(
                        `a:nth-child(${index + 2})`
                      ) as HTMLElement;
                      nextLink?.focus();
                    } else if (e.key === 'ArrowUp') {
                      e.preventDefault();
                      const prevLink = e.currentTarget.parentElement?.querySelector(
                        `a:nth-child(${index})`
                      ) as HTMLElement;
                      prevLink?.focus();
                    } else if (e.key === 'Home') {
                      e.preventDefault();
                      const firstLink = e.currentTarget.parentElement?.querySelector(
                        'a:first-child'
                      ) as HTMLElement;
                      firstLink?.focus();
                    } else if (e.key === 'End') {
                      e.preventDefault();
                      const lastLink = e.currentTarget.parentElement?.querySelector(
                        'a:last-child'
                      ) as HTMLElement;
                      lastLink?.focus();
                    }
                  }}
                >
                  {link.label}
                </a>
              ))}
            </div>

            {/* Mobile Action Buttons */}
            <div className="flex flex-col gap-sm p-sm border-t border-neutral-border">
              <Button
                variant="secondary"
                size="regular"
                onClick={() => setIsMenuOpen(false)}
                className="w-full"
              >
                Sign In
              </Button>
              <Button
                variant="primary"
                size="regular"
                onClick={() => setIsMenuOpen(false)}
                className="w-full"
              >
                Launch App
              </Button>
            </div>
          </div>
        </nav>
      )}
    </div>
  );
};

export default Navigation;
