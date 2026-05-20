import React from 'react';
import { Card } from './Card';
import { Container } from './Container';

interface WorkflowStep {
  id: string;
  number: number;
  icon: React.ReactNode;
  title: string;
  description: string;
}

interface WorkflowSectionProps {
  heading?: string;
  steps?: WorkflowStep[];
  testId?: string;
}

/**
 * Workflow Section Component
 * 
 * A responsive section displaying workflow steps with indicators and connectors.
 * 
 * Features:
 * - Padding: 96px 24px (desktop), 64px 16px (tablet), 48px 12px (mobile)
 * - White background
 * - Desktop: horizontal flex layout with 32px gap
 * - Tablet: horizontal flex with 24px gap
 * - Mobile: vertical stack with 24px gap
 * - Step indicators with numbers and connectors
 * - Progressive workflow explanation
 * 
 * @example
 * <WorkflowSection
 *   heading="How It Works"
 *   steps={[
 *     {
 *       id: '1',
 *       number: 1,
 *       icon: <IconComponent />,
 *       title: 'Step 1',
 *       description: 'Description of step 1'
 *     }
 *   ]}
 * />
 */
export const WorkflowSection: React.FC<WorkflowSectionProps> = ({
  heading = 'The Freightpilot Workflow',
  steps = [
    {
      id: '1',
      number: 1,
      icon: '📝',
      title: 'Capture Intent',
      description: 'Define your operational requirements and constraints.',
    },
    {
      id: '2',
      number: 2,
      icon: '✓',
      title: 'Validate Legality',
      description: 'Ensure compliance with all regulatory requirements.',
    },
    {
      id: '3',
      number: 3,
      icon: '🚀',
      title: 'Execute & Adapt',
      description: 'Deploy operations and adapt in real-time as needed.',
    },
  ],
  testId,
}) => {
  return (
    <section
      className="py-16 md:py-24"
      data-testid={testId}
      aria-label="Workflow steps"
    >
      <Container>
        {/* Section Heading */}
        <div className="mb-12 md:mb-16 text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
            {heading}
          </h2>
        </div>

        {/* Workflow Steps Container */}
        <div className="flex flex-col md:flex-row gap-6 md:gap-8 relative">
          {steps.map((step, index) => (
            <div key={step.id} className="flex-1 relative">
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div
                  className="hidden md:block absolute top-12 left-1/2 w-full h-0.5 bg-white/20"
                  style={{
                    width: 'calc(100% + 16px)',
                    left: '50%',
                    transform: 'translateX(-50%)',
                  }}
                  aria-hidden="true"
                />
              )}

              {/* Step Card */}
              <article
                className="flex flex-col relative z-10 h-full animate-slide-in focus-within:outline-none focus-within:ring-2 focus-within:ring-sky focus-within:ring-offset-2 rounded-2xl"
                style={{ animationDelay: `${index * 0.15}s` }}
                data-testid={`workflow-step-${step.id}`}
                tabIndex={0}
                role="region"
                aria-label={`Step ${step.number}: ${step.title}`}
              >
                <Card className="flex flex-col h-full border border-white/10 bg-white/5 backdrop-blur-lg hover:bg-white/10 transition-all duration-300 hover:-translate-y-1">
                  {/* Step Indicator */}
                  <div className="flex items-center gap-4 mb-4 md:mb-6">
                    <div
                      className="w-12 h-12 rounded-full bg-gradient-to-r from-sky to-horizon text-white flex items-center justify-center font-bold text-lg"
                      aria-label={`Step ${step.number}`}
                    >
                      {step.number}
                    </div>
                    <div className="text-2xl" aria-hidden="true">{step.icon}</div>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl md:text-2xl font-semibold text-white mb-3 md:mb-4">
                    {step.title}
                  </h3>

                  {/* Description */}
                  <p className="text-base md:text-lg text-slate-300 flex-grow" style={{ lineHeight: '1.6' }}>
                    {step.description}
                  </p>
                </Card>
              </article>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
};

export default WorkflowSection;
