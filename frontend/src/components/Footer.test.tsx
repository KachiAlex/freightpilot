import React from 'react';
import { render, screen } from '@testing-library/react';
import { Footer } from './Footer';

// Mock the Container component
jest.mock('./Container', () => ({
  Container: ({ children }: any) => <div>{children}</div>,
}));

describe('Footer Component', () => {
  it('renders footer', () => {
    render(<Footer />);
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });

  it('renders default footer sections', () => {
    render(<Footer />);
    expect(screen.getByText('Product')).toBeInTheDocument();
    expect(screen.getByText('Company')).toBeInTheDocument();
    expect(screen.getByText('Legal')).toBeInTheDocument();
  });

  it('renders default footer links', () => {
    render(<Footer />);
    expect(screen.getByText('Features')).toBeInTheDocument();
    expect(screen.getByText('Pricing')).toBeInTheDocument();
    expect(screen.getByText('Documentation')).toBeInTheDocument();
    expect(screen.getByText('About')).toBeInTheDocument();
    expect(screen.getByText('Blog')).toBeInTheDocument();
    expect(screen.getByText('Careers')).toBeInTheDocument();
    expect(screen.getByText('Contact')).toBeInTheDocument();
    expect(screen.getByText('Privacy Policy')).toBeInTheDocument();
    expect(screen.getByText('Terms of Service')).toBeInTheDocument();
    expect(screen.getByText('Compliance')).toBeInTheDocument();
  });

  it('renders custom footer sections', () => {
    const customSections = [
      {
        title: 'Custom Section',
        links: [
          { label: 'Custom Link 1', href: '/custom1' },
          { label: 'Custom Link 2', href: '/custom2' },
        ],
      },
    ];

    render(<Footer sections={customSections} />);
    expect(screen.getByText('Custom Section')).toBeInTheDocument();
    expect(screen.getByText('Custom Link 1')).toBeInTheDocument();
    expect(screen.getByText('Custom Link 2')).toBeInTheDocument();
  });

  it('renders default copyright text', () => {
    render(<Footer />);
    expect(screen.getByText('© 2024 Freightpilot. All rights reserved.')).toBeInTheDocument();
  });

  it('renders custom copyright text', () => {
    render(<Footer copyrightText="Custom Copyright" />);
    expect(screen.getByText('Custom Copyright')).toBeInTheDocument();
  });

  it('renders default social links', () => {
    render(<Footer />);
    expect(screen.getByLabelText('Twitter')).toBeInTheDocument();
    expect(screen.getByLabelText('LinkedIn')).toBeInTheDocument();
    expect(screen.getByLabelText('GitHub')).toBeInTheDocument();
  });

  it('renders custom social links', () => {
    const customSocialLinks = [
      { name: 'Facebook', icon: 'f', href: 'https://facebook.com' },
      { name: 'Instagram', icon: '📷', href: 'https://instagram.com' },
    ];

    render(<Footer socialLinks={customSocialLinks} />);
    expect(screen.getByLabelText('Facebook')).toBeInTheDocument();
    expect(screen.getByLabelText('Instagram')).toBeInTheDocument();
  });

  it('footer links have correct href attributes', () => {
    render(<Footer />);
    expect(screen.getByText('Features').closest('a')).toHaveAttribute('href', '/features');
    expect(screen.getByText('Pricing').closest('a')).toHaveAttribute('href', '/pricing');
    expect(screen.getByText('Documentation').closest('a')).toHaveAttribute('href', '/docs');
  });

  it('social links have correct href attributes', () => {
    render(<Footer />);
    expect(screen.getByLabelText('Twitter').closest('a')).toHaveAttribute('href', 'https://twitter.com');
    expect(screen.getByLabelText('LinkedIn').closest('a')).toHaveAttribute('href', 'https://linkedin.com');
    expect(screen.getByLabelText('GitHub').closest('a')).toHaveAttribute('href', 'https://github.com');
  });

  it('social links open in new tab', () => {
    render(<Footer />);
    const socialLinks = screen.getAllByRole('link').filter((link) =>
      link.getAttribute('href')?.startsWith('https://')
    );
    socialLinks.forEach((link) => {
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });
  });

  it('applies correct styling classes to footer', () => {
    render(<Footer />);
    const footer = screen.getByRole('contentinfo');
    expect(footer).toHaveClass('bg-neutral-800');
    expect(footer).toHaveClass('text-neutral-white');
    expect(footer).toHaveClass('border-t');
    expect(footer).toHaveClass('border-neutral-700');
  });

  it('applies responsive grid classes', () => {
    const { container } = render(<Footer />);
    const grid = container.querySelector('.grid');
    expect(grid).toHaveClass('grid-cols-1');
    expect(grid).toHaveClass('tablet:grid-cols-2');
    expect(grid).toHaveClass('desktop:grid-cols-3');
  });

  it('applies responsive gap classes', () => {
    const { container } = render(<Footer />);
    const grid = container.querySelector('.grid');
    expect(grid).toHaveClass('gap-2xl');
    expect(grid).toHaveClass('tablet:gap-2xl');
    expect(grid).toHaveClass('mobile:gap-2xl');
  });

  it('sets data-testid when provided', () => {
    render(<Footer testId="test-footer" />);
    expect(screen.getByTestId('test-footer')).toBeInTheDocument();
  });

  it('renders as a footer element', () => {
    render(<Footer />);
    const footer = screen.getByRole('contentinfo');
    expect(footer.tagName).toBe('FOOTER');
  });

  it('has proper semantic HTML structure', () => {
    render(<Footer />);
    const navs = screen.getAllByRole('navigation');
    expect(navs.length).toBeGreaterThan(0);
  });

  it('footer section titles are h3 elements', () => {
    render(<Footer />);
    const titles = screen.getAllByRole('heading', { level: 3 });
    expect(titles.length).toBeGreaterThan(0);
  });

  it('footer links are in list items', () => {
    render(<Footer />);
    const listItems = screen.getAllByRole('listitem');
    expect(listItems.length).toBeGreaterThan(0);
  });

  it('applies correct styling to footer links', () => {
    render(<Footer />);
    const links = screen.getAllByRole('link').filter((link) =>
      !link.getAttribute('href')?.startsWith('https://')
    );
    links.forEach((link) => {
      expect(link).toHaveClass('text-body_sm');
      expect(link).toHaveClass('text-neutral-medium');
      expect(link).toHaveClass('hover:text-neutral-white');
      expect(link).toHaveClass('transition-colors');
      expect(link).toHaveClass('duration-200');
    });
  });

  it('applies correct styling to social links', () => {
    render(<Footer />);
    const socialLinks = screen.getAllByRole('link').filter((link) =>
      link.getAttribute('href')?.startsWith('https://')
    );
    socialLinks.forEach((link) => {
      expect(link).toHaveClass('text-neutral-medium');
      expect(link).toHaveClass('hover:text-neutral-white');
      expect(link).toHaveClass('transition-colors');
      expect(link).toHaveClass('duration-200');
    });
  });

  it('renders correct number of footer sections', () => {
    const customSections = [
      {
        title: 'Section 1',
        links: [{ label: 'Link 1', href: '/link1' }],
      },
      {
        title: 'Section 2',
        links: [{ label: 'Link 2', href: '/link2' }],
      },
      {
        title: 'Section 3',
        links: [{ label: 'Link 3', href: '/link3' }],
      },
      {
        title: 'Section 4',
        links: [{ label: 'Link 4', href: '/link4' }],
      },
    ];

    render(<Footer sections={customSections} />);
    expect(screen.getByText('Section 1')).toBeInTheDocument();
    expect(screen.getByText('Section 2')).toBeInTheDocument();
    expect(screen.getByText('Section 3')).toBeInTheDocument();
    expect(screen.getByText('Section 4')).toBeInTheDocument();
  });

  it('footer bottom has correct styling', () => {
    const { container } = render(<Footer />);
    const footerBottom = container.querySelector('.pt-2xl');
    expect(footerBottom).toHaveClass('border-t');
    expect(footerBottom).toHaveClass('border-neutral-700');
    expect(footerBottom).toHaveClass('flex');
    expect(footerBottom).toHaveClass('justify-between');
  });
});
