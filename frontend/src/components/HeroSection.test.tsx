import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { HeroSection } from './HeroSection';

describe('HeroSection Component', () => {
  it('renders hero section', () => {
    const { container } = render(<HeroSection />);
    const section = container.querySelector('section');
    expect(section).toBeInTheDocument();
  });

  it('renders default headline', () => {
    render(<HeroSection />);
    expect(screen.getByText('Orchestrate Your Fleet Operations')).toBeInTheDocument();
  });

  it('renders custom headline', () => {
    render(<HeroSection headline="Custom Headline" />);
    expect(screen.getByText('Custom Headline')).toBeInTheDocument();
  });

  it('renders default subheading', () => {
    render(<HeroSection />);
    expect(
      screen.getByText(/Freightpilot helps logistics companies/)
    ).toBeInTheDocument();
  });

  it('renders custom subheading', () => {
    render(<HeroSection subheading="Custom subheading" />);
    expect(screen.getByText('Custom subheading')).toBeInTheDocument();
  });

  it('renders primary CTA button with default text', () => {
    render(<HeroSection />);
    expect(screen.getByText('Schedule a Trip')).toBeInTheDocument();
  });

  it('renders primary CTA button with custom text', () => {
    render(<HeroSection primaryCTAText="Custom Primary" />);
    expect(screen.getByText('Custom Primary')).toBeInTheDocument();
  });

  it('renders secondary CTA button with default text', () => {
    render(<HeroSection />);
    expect(screen.getByText('View Documentation')).toBeInTheDocument();
  });

  it('renders secondary CTA button with custom text', () => {
    render(<HeroSection secondaryCTAText="Custom Secondary" />);
    expect(screen.getByText('Custom Secondary')).toBeInTheDocument();
  });

  it('calls onPrimaryCTA when primary button is clicked', () => {
    const handlePrimaryCTA = vi.fn();
    render(<HeroSection onPrimaryCTA={handlePrimaryCTA} />);

    const primaryButton = screen.getByText('Schedule a Trip');
    fireEvent.click(primaryButton);

    expect(handlePrimaryCTA).toHaveBeenCalledTimes(1);
  });

  it('calls onSecondaryCTA when secondary button is clicked', () => {
    const handleSecondaryCTA = vi.fn();
    render(<HeroSection onSecondaryCTA={handleSecondaryCTA} />);

    const secondaryButton = screen.getByText('View Documentation');
    fireEvent.click(secondaryButton);

    expect(handleSecondaryCTA).toHaveBeenCalledTimes(1);
  });

  it('renders hero image with default URL', () => {
    render(<HeroSection />);
    const image = screen.getByAltText('Hero section illustration');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', 'https://via.placeholder.com/400x400?text=Hero+Image');
  });

  it('renders hero image with custom URL', () => {
    render(<HeroSection imageUrl="https://example.com/image.jpg" />);
    const image = screen.getByAltText('Hero section illustration');
    expect(image).toHaveAttribute('src', 'https://example.com/image.jpg');
  });

  it('renders hero image with custom alt text', () => {
    render(<HeroSection imageAlt="Custom alt text" />);
    const image = screen.getByAltText('Custom alt text');
    expect(image).toBeInTheDocument();
  });

  it('sets lazy loading on hero image', () => {
    render(<HeroSection />);
    const image = screen.getByAltText('Hero section illustration');
    expect(image).toHaveAttribute('loading', 'lazy');
  });

  it('renders headline as h1', () => {
    render(<HeroSection />);
    const headline = screen.getByRole('heading', { level: 1 });
    expect(headline).toBeInTheDocument();
  });

  it('applies correct styling classes to headline', () => {
    render(<HeroSection />);
    const headline = screen.getByRole('heading', { level: 1 });
    expect(headline).toHaveClass('text-h1');
    expect(headline).toHaveClass('text-neutral-dark');
  });

  it('applies correct styling classes to subheading', () => {
    render(<HeroSection />);
    const subheading = screen.getByText(/Freightpilot helps logistics companies/);
    expect(subheading).toHaveClass('text-body_lg');
    expect(subheading).toHaveClass('text-neutral-medium');
  });

  it('sets data-testid when provided', () => {
    render(<HeroSection testId="test-hero" />);
    expect(screen.getByTestId('test-hero')).toBeInTheDocument();
  });

  it('renders as a section element', () => {
    const { container } = render(<HeroSection />);
    const section = container.querySelector('section');
    expect(section).toBeInTheDocument();
    expect(section?.tagName).toBe('SECTION');
  });

  it('has proper button aria-labels', () => {
    render(<HeroSection />);
    expect(screen.getByLabelText('Schedule a Trip')).toBeInTheDocument();
    expect(screen.getByLabelText('View Documentation')).toBeInTheDocument();
  });

  it('renders buttons in correct order', () => {
    render(<HeroSection />);
    const buttons = screen.getAllByRole('button');
    expect(buttons[0]).toHaveTextContent('Schedule a Trip');
    expect(buttons[1]).toHaveTextContent('View Documentation');
  });

  it('applies responsive classes for mobile layout', () => {
    const { container } = render(<HeroSection />);
    const section = container.querySelector('section');
    expect(section).toHaveClass('mobile:pt-3xl');
    expect(section).toHaveClass('mobile:pb-2xl');
  });

  it('applies responsive classes for tablet layout', () => {
    const { container } = render(<HeroSection />);
    const section = container.querySelector('section');
    expect(section).toHaveClass('tablet:pt-3xl');
    expect(section).toHaveClass('tablet:pb-3xl');
  });

  it('applies responsive classes for desktop layout', () => {
    const { container } = render(<HeroSection />);
    const section = container.querySelector('section');
    expect(section).toHaveClass('desktop:pt-4xl');
    expect(section).toHaveClass('desktop:pb-4xl');
  });

  it('renders responsive image container with square aspect ratio', () => {
    const { container } = render(<HeroSection />);
    const imageContainer = container.querySelector('[class*="aspect-square"]');
    expect(imageContainer).toBeInTheDocument();
  });

  it('renders responsive image with srcSet for different viewports', () => {
    render(<HeroSection />);
    const image = screen.getByAltText('Hero section illustration');
    expect(image).toHaveAttribute('srcSet');
  });

  it('renders responsive image with sizes attribute', () => {
    render(<HeroSection />);
    const image = screen.getByAltText('Hero section illustration');
    expect(image).toHaveAttribute('sizes');
  });

  it('renders responsive image with object-fit cover', () => {
    const { container } = render(<HeroSection />);
    const image = container.querySelector('img');
    expect(image).toHaveClass('object-cover');
  });
});
