import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { SocialProof } from './SocialProof';

describe('SocialProof Component', () => {
  it('renders social proof section', () => {
    render(<SocialProof />);
    expect(screen.getByRole('region')).toBeInTheDocument();
  });

  it('renders default heading', () => {
    render(<SocialProof />);
    expect(screen.getByText('Trusted by leading logistics companies')).toBeInTheDocument();
  });

  it('renders custom heading', () => {
    render(<SocialProof heading="Custom Heading" />);
    expect(screen.getByText('Custom Heading')).toBeInTheDocument();
  });

  it('renders default company logos', () => {
    render(<SocialProof />);
    expect(screen.getByAltText('Company 1')).toBeInTheDocument();
    expect(screen.getByAltText('Company 2')).toBeInTheDocument();
    expect(screen.getByAltText('Company 3')).toBeInTheDocument();
    expect(screen.getByAltText('Company 4')).toBeInTheDocument();
    expect(screen.getByAltText('Company 5')).toBeInTheDocument();
    expect(screen.getByAltText('Company 6')).toBeInTheDocument();
  });

  it('renders custom company logos', () => {
    const customCompanies = [
      {
        id: '1',
        name: 'Custom Company 1',
        logoUrl: 'https://example.com/logo1.png',
      },
      {
        id: '2',
        name: 'Custom Company 2',
        logoUrl: 'https://example.com/logo2.png',
      },
    ];

    render(<SocialProof companies={customCompanies} />);
    expect(screen.getByAltText('Custom Company 1')).toBeInTheDocument();
    expect(screen.getByAltText('Custom Company 2')).toBeInTheDocument();
  });

  it('renders company logo cards with correct testIds', () => {
    render(<SocialProof />);
    expect(screen.getByTestId('company-logo-1')).toBeInTheDocument();
    expect(screen.getByTestId('company-logo-2')).toBeInTheDocument();
    expect(screen.getByTestId('company-logo-3')).toBeInTheDocument();
    expect(screen.getByTestId('company-logo-4')).toBeInTheDocument();
    expect(screen.getByTestId('company-logo-5')).toBeInTheDocument();
    expect(screen.getByTestId('company-logo-6')).toBeInTheDocument();
  });

  it('renders heading as h2', () => {
    render(<SocialProof />);
    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading).toBeInTheDocument();
  });

  it('applies correct styling classes to section', () => {
    render(<SocialProof />);
    const section = screen.getByRole('region');
    expect(section).toHaveClass('py-3xl');
    expect(section).toHaveClass('px-lg');
    expect(section).toHaveClass('bg-neutral-white');
    expect(section).toHaveClass('border-t');
    expect(section).toHaveClass('border-neutral-border');
  });

  it('applies responsive grid classes', () => {
    const { container } = render(<SocialProof />);
    const grid = container.querySelector('.grid');
    expect(grid).toHaveClass('grid-cols-2');
    expect(grid).toHaveClass('tablet:grid-cols-3');
    expect(grid).toHaveClass('desktop:grid-cols-6');
  });

  it('applies responsive gap classes', () => {
    const { container } = render(<SocialProof />);
    const grid = container.querySelector('.grid');
    expect(grid).toHaveClass('gap-lg');
    expect(grid).toHaveClass('tablet:gap-md');
    expect(grid).toHaveClass('mobile:gap-md');
  });

  it('sets data-testid when provided', () => {
    render(<SocialProof testId="test-social-proof" />);
    expect(screen.getByTestId('test-social-proof')).toBeInTheDocument();
  });

  it('renders as a section element', () => {
    render(<SocialProof />);
    const section = screen.getByRole('region');
    expect(section.tagName).toBe('SECTION');
  });

  it('renders correct number of company logos', () => {
    const customCompanies = [
      {
        id: '1',
        name: 'Company 1',
        logoUrl: 'https://example.com/logo1.png',
      },
      {
        id: '2',
        name: 'Company 2',
        logoUrl: 'https://example.com/logo2.png',
      },
      {
        id: '3',
        name: 'Company 3',
        logoUrl: 'https://example.com/logo3.png',
      },
      {
        id: '4',
        name: 'Company 4',
        logoUrl: 'https://example.com/logo4.png',
      },
    ];

    render(<SocialProof companies={customCompanies} />);
    expect(screen.getByTestId('company-logo-1')).toBeInTheDocument();
    expect(screen.getByTestId('company-logo-2')).toBeInTheDocument();
    expect(screen.getByTestId('company-logo-3')).toBeInTheDocument();
    expect(screen.getByTestId('company-logo-4')).toBeInTheDocument();
  });

  it('company logos have lazy loading', () => {
    render(<SocialProof />);
    const images = screen.getAllByRole('img');
    images.forEach((img) => {
      expect(img).toHaveAttribute('loading', 'lazy');
    });
  });

  it('company logos have correct object-fit', () => {
    render(<SocialProof />);
    const images = screen.getAllByRole('img');
    images.forEach((img) => {
      expect(img).toHaveClass('object-contain');
    });
  });

  it('company logo containers have hover opacity transition', () => {
    const { container } = render(<SocialProof />);
    const logoContainers = container.querySelectorAll('[data-testid^="company-logo"]');
    logoContainers.forEach((container) => {
      expect(container).toHaveClass('transition-opacity');
      expect(container).toHaveClass('duration-200');
      expect(container).toHaveClass('hover:opacity-100');
    });
  });

  it('company logo containers have initial opacity', () => {
    const { container } = render(<SocialProof />);
    const logoContainers = container.querySelectorAll('[data-testid^="company-logo"]');
    logoContainers.forEach((container) => {
      expect(container).toHaveStyle({ opacity: '0.6' });
    });
  });

  it('renders heading with correct styling', () => {
    render(<SocialProof />);
    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading).toHaveClass('text-h2');
    expect(heading).toHaveClass('text-neutral-dark');
  });
});
