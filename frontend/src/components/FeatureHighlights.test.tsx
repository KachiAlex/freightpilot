import React from 'react';
import { render, screen } from '@testing-library/react';
import { FeatureHighlights } from './FeatureHighlights';

// Mock the Card component
jest.mock('./Card', () => ({
  Card: ({ children, testId }: any) => <div data-testid={testId}>{children}</div>,
}));

// Mock the Container component
jest.mock('./Container', () => ({
  Container: ({ children }: any) => <div>{children}</div>,
}));

describe('FeatureHighlights Component', () => {
  it('renders feature highlights section', () => {
    render(<FeatureHighlights />);
    expect(screen.getByRole('region')).toBeInTheDocument();
  });

  it('renders default heading', () => {
    render(<FeatureHighlights />);
    expect(screen.getByText('Why Choose Freightpilot')).toBeInTheDocument();
  });

  it('renders custom heading', () => {
    render(<FeatureHighlights heading="Custom Heading" />);
    expect(screen.getByText('Custom Heading')).toBeInTheDocument();
  });

  it('renders default features', () => {
    render(<FeatureHighlights />);
    expect(screen.getByText('Fleet Orchestration')).toBeInTheDocument();
    expect(screen.getByText('Compliance Assurance')).toBeInTheDocument();
    expect(screen.getByText('Data-Driven Insights')).toBeInTheDocument();
  });

  it('renders custom features', () => {
    const customFeatures = [
      {
        id: '1',
        icon: '🎯',
        title: 'Custom Feature 1',
        description: 'Custom description 1',
      },
      {
        id: '2',
        icon: '🚀',
        title: 'Custom Feature 2',
        description: 'Custom description 2',
      },
    ];

    render(<FeatureHighlights features={customFeatures} />);
    expect(screen.getByText('Custom Feature 1')).toBeInTheDocument();
    expect(screen.getByText('Custom Feature 2')).toBeInTheDocument();
    expect(screen.getByText('Custom description 1')).toBeInTheDocument();
    expect(screen.getByText('Custom description 2')).toBeInTheDocument();
  });

  it('renders feature icons', () => {
    render(<FeatureHighlights />);
    expect(screen.getByText('🚚')).toBeInTheDocument();
    expect(screen.getByText('✓')).toBeInTheDocument();
    expect(screen.getByText('📊')).toBeInTheDocument();
  });

  it('renders feature descriptions', () => {
    render(<FeatureHighlights />);
    expect(
      screen.getByText('Intelligently manage and optimize your entire fleet operations in real-time.')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Ensure all operations meet regulatory requirements and industry standards.')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Make informed decisions with comprehensive analytics and reporting.')
    ).toBeInTheDocument();
  });

  it('renders feature cards with correct testIds', () => {
    render(<FeatureHighlights />);
    expect(screen.getByTestId('feature-card-1')).toBeInTheDocument();
    expect(screen.getByTestId('feature-card-2')).toBeInTheDocument();
    expect(screen.getByTestId('feature-card-3')).toBeInTheDocument();
  });

  it('renders heading as h2', () => {
    render(<FeatureHighlights />);
    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading).toBeInTheDocument();
  });

  it('renders feature titles as h3', () => {
    render(<FeatureHighlights />);
    const titles = screen.getAllByRole('heading', { level: 3 });
    expect(titles).toHaveLength(3);
  });

  it('applies correct styling classes to section', () => {
    render(<FeatureHighlights />);
    const section = screen.getByRole('region');
    expect(section).toHaveClass('py-4xl');
    expect(section).toHaveClass('bg-neutral-light');
  });

  it('applies responsive padding classes', () => {
    render(<FeatureHighlights />);
    const section = screen.getByRole('region');
    expect(section).toHaveClass('desktop:py-4xl');
    expect(section).toHaveClass('tablet:py-3xl');
    expect(section).toHaveClass('mobile:py-3xl');
  });

  it('applies responsive grid classes', () => {
    const { container } = render(<FeatureHighlights />);
    const grid = container.querySelector('.grid');
    expect(grid).toHaveClass('grid-cols-1');
    expect(grid).toHaveClass('tablet:grid-cols-2');
    expect(grid).toHaveClass('desktop:grid-cols-3');
  });

  it('applies responsive gap classes', () => {
    const { container } = render(<FeatureHighlights />);
    const grid = container.querySelector('.grid');
    expect(grid).toHaveClass('gap-lg');
    expect(grid).toHaveClass('tablet:gap-md');
    expect(grid).toHaveClass('mobile:gap-md');
  });

  it('sets data-testid when provided', () => {
    render(<FeatureHighlights testId="test-features" />);
    expect(screen.getByTestId('test-features')).toBeInTheDocument();
  });

  it('renders as a section element', () => {
    render(<FeatureHighlights />);
    const section = screen.getByRole('region');
    expect(section.tagName).toBe('SECTION');
  });

  it('renders correct number of features', () => {
    const customFeatures = [
      {
        id: '1',
        icon: '🎯',
        title: 'Feature 1',
        description: 'Description 1',
      },
      {
        id: '2',
        icon: '🚀',
        title: 'Feature 2',
        description: 'Description 2',
      },
      {
        id: '3',
        icon: '⭐',
        title: 'Feature 3',
        description: 'Description 3',
      },
      {
        id: '4',
        icon: '💡',
        title: 'Feature 4',
        description: 'Description 4',
      },
    ];

    render(<FeatureHighlights features={customFeatures} />);
    expect(screen.getByTestId('feature-card-1')).toBeInTheDocument();
    expect(screen.getByTestId('feature-card-2')).toBeInTheDocument();
    expect(screen.getByTestId('feature-card-3')).toBeInTheDocument();
    expect(screen.getByTestId('feature-card-4')).toBeInTheDocument();
  });

  it('applies correct styling to feature titles', () => {
    render(<FeatureHighlights />);
    const titles = screen.getAllByRole('heading', { level: 3 });
    titles.forEach((title) => {
      expect(title).toHaveClass('text-h3');
      expect(title).toHaveClass('text-neutral-dark');
      expect(title).toHaveClass('font-semibold');
    });
  });

  it('applies correct styling to feature descriptions', () => {
    render(<FeatureHighlights />);
    const descriptions = screen.getAllByText(/Intelligently manage|Ensure all|Make informed/);
    descriptions.forEach((desc) => {
      expect(desc).toHaveClass('text-body');
      expect(desc).toHaveClass('text-neutral-medium');
    });
  });
});
