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
      className="py-2xl mobile:py-2xl tablet:py-3xl desktop:py-4xl bg-neutral-white"
      data-testid={testId}
      aria-label="Workflow steps"
    >
      <Container>
        {/* Section Heading */}
        <div className="mb-2xl mobile:mb-2xl tablet:mb-3xl desktop:mb-3xl text-center">
          <h2 className="text-h2 text-neutral-dark">
            {heading}
          </h2>
        </div>

        {/* Workflow Steps Container */}
        <div className="flex flex-col mobile:flex-col tablet:flex-row desktop:flex-row gap-sm mobile:gap-sm tablet:gap-md desktop:gap-2xl relative">
          {steps.map((step, index) => (
            <div key={step.id} className="flex-1 relative">
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div
                  className="hidden tablet:block absolute top-12 left-1/2 w-full h-0.5 bg-neutral-border"
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
                className="flex flex-col relative z-10 h-full animate-slide-in focus-within:outline-none focus-within:ring-2 focus-within:ring-primary-blue focus-within:ring-offset-2 rounded-lg"
                style={{ animationDelay: `${index * 0.15}s` }}
                data-testid={`workflow-step-${step.id}`}
                tabIndex={0}
                role="region"
                aria-label={`Step ${step.number}: ${step.title}`}
              >
                <Card className="flex flex-col h-full">
                  {/* Step Indicator */}
                  <div className="flex items-center gap-md mobile:gap-md tablet:gap-md desktop:gap-md mb-md mobile:mb-md tablet:mb-lg desktop:mb-lg">
                    <div
                      className="w-12 h-12 mobile:w-12 mobile:h-12 tablet:w-12 tablet:h-12 desktop:w-12 desktop:h-12 rounded-full bg-primary-blue text-neutral-white flex items-center justify-center font-bold text-lg"
                      aria-label={`Step ${step.number}`}
                    >
                      {step.number}
                    </div>
                    <div className="text-2xl mobile:text-2xl tablet:text-2xl desktop:text-2xl" aria-hidden="true">{step.icon}</div>
                  </div>

                  {/* Title */}
                  <h3 className="text-h3 text-neutral-dark font-semibold mb-md mobile:mb-md tablet:mb-lg desktop:mb-lg">
                    {step.title}
                  </h3>

                  {/* Description */}
                  <p className="text-body text-neutral-medium flex-grow" style={{ lineHeight: '1.6' }}>
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
