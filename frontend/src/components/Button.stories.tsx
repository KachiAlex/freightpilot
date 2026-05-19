import React from 'react';
import { Button } from './Button';

/**
 * Button Component Stories
 * Demonstrates all variants, sizes, and states of the Button component
 */

export const ButtonStories = () => {
  const [isLoading, setIsLoading] = React.useState(false);

  const handleLoadingClick = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 2000);
  };

  return (
    <div className="p-8 bg-neutral-light min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-h1 mb-8">Button Component Showcase</h1>

        {/* Primary Buttons */}
        <section className="mb-12">
          <h2 className="text-h2 mb-6">Primary Buttons</h2>
          <div className="flex flex-wrap gap-4 p-6 bg-white rounded-md border border-neutral-border">
            <Button size="large">Large Primary</Button>
            <Button size="regular">Regular Primary</Button>
            <Button size="small">Small Primary</Button>
          </div>
        </section>

        {/* Secondary Buttons */}
        <section className="mb-12">
          <h2 className="text-h2 mb-6">Secondary Buttons</h2>
          <div className="flex flex-wrap gap-4 p-6 bg-white rounded-md border border-neutral-border">
            <Button variant="secondary" size="large">
              Large Secondary
            </Button>
            <Button variant="secondary" size="regular">
              Regular Secondary
            </Button>
            <Button variant="secondary" size="small">
              Small Secondary
            </Button>
          </div>
        </section>

        {/* Disabled States */}
        <section className="mb-12">
          <h2 className="text-h2 mb-6">Disabled States</h2>
          <div className="flex flex-wrap gap-4 p-6 bg-white rounded-md border border-neutral-border">
            <Button disabled>Disabled Primary</Button>
            <Button variant="secondary" disabled>
              Disabled Secondary
            </Button>
          </div>
        </section>

        {/* Loading States */}
        <section className="mb-12">
          <h2 className="text-h2 mb-6">Loading States</h2>
          <div className="flex flex-wrap gap-4 p-6 bg-white rounded-md border border-neutral-border">
            <Button isLoading>Loading Primary</Button>
            <Button variant="secondary" isLoading>
              Loading Secondary
            </Button>
            <Button onClick={handleLoadingClick} isLoading={isLoading}>
              {isLoading ? 'Processing...' : 'Click to Load'}
            </Button>
          </div>
        </section>

        {/* All Sizes Comparison */}
        <section className="mb-12">
          <h2 className="text-h2 mb-6">Size Comparison</h2>
          <div className="space-y-4 p-6 bg-white rounded-md border border-neutral-border">
            <div className="flex items-center gap-4">
              <span className="w-24 text-sm font-semibold">Large (48px)</span>
              <Button size="large">Large Button</Button>
            </div>
            <div className="flex items-center gap-4">
              <span className="w-24 text-sm font-semibold">Regular (44px)</span>
              <Button size="regular">Regular Button</Button>
            </div>
            <div className="flex items-center gap-4">
              <span className="w-24 text-sm font-semibold">Small (36px)</span>
              <Button size="small">Small Button</Button>
            </div>
          </div>
        </section>

        {/* Variant Comparison */}
        <section className="mb-12">
          <h2 className="text-h2 mb-6">Variant Comparison</h2>
          <div className="space-y-4 p-6 bg-white rounded-md border border-neutral-border">
            <div className="flex items-center gap-4">
              <span className="w-24 text-sm font-semibold">Primary</span>
              <Button variant="primary">Primary Button</Button>
            </div>
            <div className="flex items-center gap-4">
              <span className="w-24 text-sm font-semibold">Secondary</span>
              <Button variant="secondary">Secondary Button</Button>
            </div>
          </div>
        </section>

        {/* CTA Examples */}
        <section className="mb-12">
          <h2 className="text-h2 mb-6">Common CTA Patterns</h2>
          <div className="space-y-6 p-6 bg-white rounded-md border border-neutral-border">
            <div>
              <h3 className="text-h3 mb-4">Hero Section CTAs</h3>
              <div className="flex flex-wrap gap-4">
                <Button size="large">Schedule a Trip</Button>
                <Button variant="secondary" size="large">
                  View Documentation
                </Button>
              </div>
            </div>

            <div>
              <h3 className="text-h3 mb-4">Form Actions</h3>
              <div className="flex flex-wrap gap-4">
                <Button>Submit</Button>
                <Button variant="secondary">Cancel</Button>
              </div>
            </div>

            <div>
              <h3 className="text-h3 mb-4">Inline Actions</h3>
              <div className="flex flex-wrap gap-2">
                <Button size="small">Edit</Button>
                <Button size="small" variant="secondary">
                  Delete
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Accessibility Features */}
        <section className="mb-12">
          <h2 className="text-h2 mb-6">Accessibility Features</h2>
          <div className="space-y-4 p-6 bg-white rounded-md border border-neutral-border">
            <div>
              <h3 className="text-h3 mb-2">Focus Indicator (Tab to see)</h3>
              <Button>Tab to see focus indicator</Button>
            </div>
            <div>
              <h3 className="text-h3 mb-2">Keyboard Navigation</h3>
              <p className="text-body_sm text-neutral-medium mb-2">
                All buttons are keyboard accessible. Use Tab to navigate and Enter/Space to activate.
              </p>
            </div>
            <div>
              <h3 className="text-h3 mb-2">ARIA Labels</h3>
              <Button ariaLabel="Submit the contact form">
                Submit
              </Button>
            </div>
            <div>
              <h3 className="text-h3 mb-2">Touch Target Size</h3>
              <p className="text-body_sm text-neutral-medium mb-2">
                Regular and Large buttons meet 44px minimum touch target height requirement.
              </p>
            </div>
          </div>
        </section>

        {/* Design Specifications */}
        <section>
          <h2 className="text-h2 mb-6">Design Specifications</h2>
          <div className="space-y-4 p-6 bg-white rounded-md border border-neutral-border">
            <div>
              <h3 className="text-h3 mb-2">Primary Button</h3>
              <ul className="list-disc list-inside space-y-1 text-body_sm text-neutral-medium">
                <li>Background: #0066FF</li>
                <li>Text: White</li>
                <li>Hover: #0052CC with shadow</li>
                <li>Active: #003D99</li>
                <li>Focus: 2px outline with 2px offset</li>
                <li>Disabled: 50% opacity</li>
              </ul>
            </div>

            <div>
              <h3 className="text-h3 mb-2">Secondary Button</h3>
              <ul className="list-disc list-inside space-y-1 text-body_sm text-neutral-medium">
                <li>Background: Transparent</li>
                <li>Border: 2px #0066FF</li>
                <li>Text: #0066FF</li>
                <li>Hover: #E6F0FF background</li>
                <li>Active: #D4E6FF background</li>
                <li>Focus: 2px outline with 2px offset</li>
              </ul>
            </div>

            <div>
              <h3 className="text-h3 mb-2">Sizes</h3>
              <ul className="list-disc list-inside space-y-1 text-body_sm text-neutral-medium">
                <li>Large: 48px height, 16px 32px padding, 18px font</li>
                <li>Regular: 44px height, 12px 24px padding, 16px font</li>
                <li>Small: 36px height, 8px 16px padding, 14px font</li>
              </ul>
            </div>

            <div>
              <h3 className="text-h3 mb-2">Animations</h3>
              <ul className="list-disc list-inside space-y-1 text-body_sm text-neutral-medium">
                <li>Transition: 200ms ease-in-out</li>
                <li>Hover: -2px translateY + shadow</li>
                <li>Active: 95% scale</li>
                <li>Loading: Animated spinner</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ButtonStories;
