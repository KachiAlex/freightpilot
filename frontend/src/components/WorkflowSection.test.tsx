import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { WorkflowSection } from './WorkflowSection';

// Mock the Card component
vi.mock('./Card', () => ({
  Card: ({ children, testId }: any) => <div data-testid={testId}>{children}</div>,
}));

// Mock the Container component
vi.mock('./Container', () => ({
  Container: ({ children }: any) => <div>{children}</div>,
}));

describe('WorkflowSection Component', () => {
  it('renders workflow section', () => {
    render(<WorkflowSection />);
    expect(screen.getByRole('region')).toBeInTheDocument();
  });

  it('renders default heading', () => {
    render(<WorkflowSection />);
    expect(screen.getByText('The Freightpilot Workflow')).toBeInTheDocument();
  });

  it('renders custom heading', () => {
    render(<WorkflowSection heading="Custom Workflow" />);
    expect(screen.getByText('Custom Workflow')).toBeInTheDocument();
  });

  it('renders default workflow steps', () => {
    render(<WorkflowSection />);
    expect(screen.getByText('Capture Intent')).toBeInTheDocument();
    expect(screen.getByText('Validate Legality')).toBeInTheDocument();
    expect(screen.getByText('Execute & Adapt')).toBeInTheDocument();
  });

  it('renders custom workflow steps', () => {
    const customSteps = [
      {
        id: '1',
        number: 1,
        icon: '🎯',
        title: 'Custom Step 1',
        description: 'Custom description 1',
      },
      {
        id: '2',
        number: 2,
        icon: '🚀',
        title: 'Custom Step 2',
        description: 'Custom description 2',
      },
    ];

    render(<WorkflowSection steps={customSteps} />);
    expect(screen.getByText('Custom Step 1')).toBeInTheDocument();
    expect(screen.getByText('Custom Step 2')).toBeInTheDocument();
  });

  it('renders step icons', () => {
    render(<WorkflowSection />);
    expect(screen.getByText('📝')).toBeInTheDocument();
    expect(screen.getByText('✓')).toBeInTheDocument();
    expect(screen.getByText('🚀')).toBeInTheDocument();
  });

  it('renders step descriptions', () => {
    render(<WorkflowSection />);
    expect(
      screen.getByText('Define your operational requirements and constraints.')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Ensure compliance with all regulatory requirements.')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Deploy operations and adapt in real-time as needed.')
    ).toBeInTheDocument();
  });

  it('renders step numbers', () => {
    render(<WorkflowSection />);
    expect(screen.getByLabelText('Step 1')).toBeInTheDocument();
    expect(screen.getByLabelText('Step 2')).toBeInTheDocument();
    expect(screen.getByLabelText('Step 3')).toBeInTheDocument();
  });

  it('renders step cards with correct testIds', () => {
    render(<WorkflowSection />);
    expect(screen.getByTestId('workflow-step-1')).toBeInTheDocument();
    expect(screen.getByTestId('workflow-step-2')).toBeInTheDocument();
    expect(screen.getByTestId('workflow-step-3')).toBeInTheDocument();
  });

  it('renders heading as h2', () => {
    render(<WorkflowSection />);
    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading).toBeInTheDocument();
  });

  it('renders step titles as h3', () => {
    render(<WorkflowSection />);
    const titles = screen.getAllByRole('heading', { level: 3 });
    expect(titles).toHaveLength(3);
  });

  it('applies correct styling classes to section', () => {
    render(<WorkflowSection />);
    const section = screen.getByRole('region');
    expect(section).toHaveClass('py-4xl');
    expect(section).toHaveClass('bg-neutral-white');
  });

  it('applies responsive padding classes', () => {
    render(<WorkflowSection />);
    const section = screen.getByRole('region');
    expect(section).toHaveClass('desktop:py-4xl');
    expect(section).toHaveClass('tablet:py-3xl');
    expect(section).toHaveClass('mobile:py-3xl');
  });

  it('applies responsive layout classes', () => {
    const { container } = render(<WorkflowSection />);
    const flexContainer = container.querySelector('.flex');
    expect(flexContainer).toHaveClass('flex-col');
    expect(flexContainer).toHaveClass('mobile:flex-col');
    expect(flexContainer).toHaveClass('tablet:flex-row');
    expect(flexContainer).toHaveClass('desktop:flex-row');
  });

  it('applies responsive gap classes', () => {
    const { container } = render(<WorkflowSection />);
    const flexContainer = container.querySelector('.flex');
    expect(flexContainer).toHaveClass('gap-2xl');
    expect(flexContainer).toHaveClass('tablet:gap-2xl');
    expect(flexContainer).toHaveClass('desktop:gap-2xl');
  });

  it('sets data-testid when provided', () => {
    render(<WorkflowSection testId="test-workflow" />);
    expect(screen.getByTestId('test-workflow')).toBeInTheDocument();
  });

  it('renders as a section element', () => {
    render(<WorkflowSection />);
    const section = screen.getByRole('region');
    expect(section.tagName).toBe('SECTION');
  });

  it('renders correct number of steps', () => {
    const customSteps = [
      {
        id: '1',
        number: 1,
        icon: '🎯',
        title: 'Step 1',
        description: 'Description 1',
      },
      {
        id: '2',
        number: 2,
        icon: '🚀',
        title: 'Step 2',
        description: 'Description 2',
      },
      {
        id: '3',
        number: 3,
        icon: '⭐',
        title: 'Step 3',
        description: 'Description 3',
      },
      {
        id: '4',
        number: 4,
        icon: '💡',
        title: 'Step 4',
        description: 'Description 4',
      },
    ];

    render(<WorkflowSection steps={customSteps} />);
    expect(screen.getByTestId('workflow-step-1')).toBeInTheDocument();
    expect(screen.getByTestId('workflow-step-2')).toBeInTheDocument();
    expect(screen.getByTestId('workflow-step-3')).toBeInTheDocument();
    expect(screen.getByTestId('workflow-step-4')).toBeInTheDocument();
  });

  it('applies correct styling to step titles', () => {
    render(<WorkflowSection />);
    const titles = screen.getAllByRole('heading', { level: 3 });
    titles.forEach((title) => {
      expect(title).toHaveClass('text-h3');
      expect(title).toHaveClass('text-neutral-dark');
      expect(title).toHaveClass('font-semibold');
    });
  });

  it('applies correct styling to step descriptions', () => {
    render(<WorkflowSection />);
    const descriptions = screen.getAllByText(/Define your|Ensure compliance|Deploy operations/);
    descriptions.forEach((desc) => {
      expect(desc).toHaveClass('text-body');
      expect(desc).toHaveClass('text-neutral-medium');
    });
  });

  it('step indicators have correct styling', () => {
    const { container } = render(<WorkflowSection />);
    const indicators = container.querySelectorAll('[aria-label^="Step"]');
    indicators.forEach((indicator) => {
      expect(indicator).toHaveClass('w-12');
      expect(indicator).toHaveClass('h-12');
      expect(indicator).toHaveClass('rounded-full');
      expect(indicator).toHaveClass('bg-primary-blue');
      expect(indicator).toHaveClass('text-neutral-white');
    });
  });
});
