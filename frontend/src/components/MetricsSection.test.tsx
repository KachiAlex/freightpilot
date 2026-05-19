import React from 'react';
import { render, screen } from '@testing-library/react';
import { MetricsSection } from './MetricsSection';

// Mock the Container component
jest.mock('./Container', () => ({
  Container: ({ children }: any) => <div>{children}</div>,
}));

describe('MetricsSection Component', () => {
  it('renders metrics section', () => {
    render(<MetricsSection />);
    expect(screen.getByRole('region')).toBeInTheDocument();
  });

  it('renders default metrics', () => {
    render(<MetricsSection />);
    expect(screen.getByText('10K+')).toBeInTheDocument();
    expect(screen.getByText('50M+')).toBeInTheDocument();
    expect(screen.getByText('100K+')).toBeInTheDocument();
  });

  it('renders metric labels', () => {
    render(<MetricsSection />);
    expect(screen.getByText('Drivers')).toBeInTheDocument();
    expect(screen.getByText('Violations')).toBeInTheDocument();
    expect(screen.getByText('Hours')).toBeInTheDocument();
  });

  it('renders metric context', () => {
    render(<MetricsSection />);
    expect(screen.getByText('Orchestrated')).toBeInTheDocument();
    expect(screen.getByText('Prevented')).toBeInTheDocument();
    expect(screen.getByText('Saved')).toBeInTheDocument();
  });

  it('renders custom metrics', () => {
    const customMetrics = [
      {
        id: '1',
        number: '5K+',
        label: 'Customers',
        context: 'Active',
      },
      {
        id: '2',
        number: '99.9%',
        label: 'Uptime',
        context: 'Guaranteed',
      },
    ];

    render(<MetricsSection metrics={customMetrics} />);
    expect(screen.getByText('5K+')).toBeInTheDocument();
    expect(screen.getByText('99.9%')).toBeInTheDocument();
    expect(screen.getByText('Customers')).toBeInTheDocument();
    expect(screen.getByText('Uptime')).toBeInTheDocument();
  });

  it('renders metric cards with correct testIds', () => {
    render(<MetricsSection />);
    expect(screen.getByTestId('metric-card-1')).toBeInTheDocument();
    expect(screen.getByTestId('metric-card-2')).toBeInTheDocument();
    expect(screen.getByTestId('metric-card-3')).toBeInTheDocument();
  });

  it('applies correct styling classes to section', () => {
    render(<MetricsSection />);
    const section = screen.getByRole('region');
    expect(section).toHaveClass('py-4xl');
  });

  it('applies responsive padding classes', () => {
    render(<MetricsSection />);
    const section = screen.getByRole('region');
    expect(section).toHaveClass('desktop:py-4xl');
    expect(section).toHaveClass('tablet:py-3xl');
    expect(section).toHaveClass('mobile:py-3xl');
  });

  it('applies responsive grid classes', () => {
    const { container } = render(<MetricsSection />);
    const grid = container.querySelector('.grid');
    expect(grid).toHaveClass('grid-cols-1');
    expect(grid).toHaveClass('tablet:grid-cols-2');
    expect(grid).toHaveClass('desktop:grid-cols-3');
  });

  it('applies responsive gap classes', () => {
    const { container } = render(<MetricsSection />);
    const grid = container.querySelector('.grid');
    expect(grid).toHaveClass('gap-2xl');
    expect(grid).toHaveClass('tablet:gap-2xl');
    expect(grid).toHaveClass('mobile:gap-2xl');
  });

  it('sets data-testid when provided', () => {
    render(<MetricsSection testId="test-metrics" />);
    expect(screen.getByTestId('test-metrics')).toBeInTheDocument();
  });

  it('renders as a section element', () => {
    render(<MetricsSection />);
    const section = screen.getByRole('region');
    expect(section.tagName).toBe('SECTION');
  });

  it('renders correct number of metrics', () => {
    const customMetrics = [
      {
        id: '1',
        number: '1',
        label: 'Metric 1',
        context: 'Context 1',
      },
      {
        id: '2',
        number: '2',
        label: 'Metric 2',
        context: 'Context 2',
      },
      {
        id: '3',
        number: '3',
        label: 'Metric 3',
        context: 'Context 3',
      },
      {
        id: '4',
        number: '4',
        label: 'Metric 4',
        context: 'Context 4',
      },
    ];

    render(<MetricsSection metrics={customMetrics} />);
    expect(screen.getByTestId('metric-card-1')).toBeInTheDocument();
    expect(screen.getByTestId('metric-card-2')).toBeInTheDocument();
    expect(screen.getByTestId('metric-card-3')).toBeInTheDocument();
    expect(screen.getByTestId('metric-card-4')).toBeInTheDocument();
  });

  it('has gradient background', () => {
    render(<MetricsSection />);
    const section = screen.getByRole('region');
    expect(section).toHaveStyle({
      background: 'linear-gradient(135deg, #0066FF 0%, #00D9FF 100%)',
    });
  });

  it('metric cards have glassmorphism styling', () => {
    const { container } = render(<MetricsSection />);
    const cards = container.querySelectorAll('[data-testid^="metric-card"]');
    cards.forEach((card) => {
      expect(card).toHaveStyle({
        background: 'rgba(255, 255, 255, 0.1)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        backdropFilter: 'blur(10px)',
      });
    });
  });

  it('renders metric numbers with correct styling', () => {
    render(<MetricsSection />);
    const numbers = screen.getAllByText(/10K\+|50M\+|100K\+/);
    numbers.forEach((number) => {
      expect(number).toHaveClass('text-4xl');
      expect(number).toHaveClass('font-bold');
      expect(number).toHaveClass('text-neutral-white');
    });
  });

  it('renders metric labels with correct styling', () => {
    render(<MetricsSection />);
    const labels = screen.getAllByText(/Drivers|Violations|Hours/);
    labels.forEach((label) => {
      expect(label).toHaveClass('text-body');
      expect(label).toHaveClass('font-normal');
    });
  });
});
