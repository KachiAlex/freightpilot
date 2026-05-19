import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { Navigation } from './Navigation';

// Mock the Button component to avoid dependency issues
vi.mock('./Button', () => ({
  Button: ({ children, onClick, ...props }: any) => (
    <button onClick={onClick} {...props}>
      {children}
    </button>
  ),
}));

describe('Navigation Component', () => {
  it('renders navigation bar', () => {
    render(<Navigation />);
    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });

  it('renders logo with correct link', () => {
    render(<Navigation />);
    const logo = screen.getAllByText('Freightpilot')[0];
    expect(logo).toBeInTheDocument();
    expect(logo.closest('a')).toHaveAttribute('href', '/');
  });

  it('renders navigation links on desktop', () => {
    render(<Navigation />);
    expect(screen.getByText('Product')).toBeInTheDocument();
    expect(screen.getByText('Workflow')).toBeInTheDocument();
    expect(screen.getByText('Compliance')).toBeInTheDocument();
  });

  it('renders action buttons', () => {
    render(<Navigation />);
    expect(screen.getByText('Sign In')).toBeInTheDocument();
    expect(screen.getByLabelText('Launch App')).toBeInTheDocument();
  });

  it('renders hamburger menu button on mobile', () => {
    render(<Navigation />);
    const hamburgerButton = screen.getByLabelText(/open menu|close menu/i);
    expect(hamburgerButton).toBeInTheDocument();
  });

  it('opens mobile menu when hamburger is clicked', () => {
    render(<Navigation />);
    const hamburgerButton = screen.getByLabelText('Open menu');
    fireEvent.click(hamburgerButton);

    expect(hamburgerButton).toHaveAttribute('aria-expanded', 'true');
  });

  it('closes mobile menu when hamburger is clicked again', () => {
    render(<Navigation />);
    const hamburgerButton = screen.getByLabelText('Open menu');
    
    fireEvent.click(hamburgerButton);
    expect(hamburgerButton).toHaveAttribute('aria-expanded', 'true');

    fireEvent.click(hamburgerButton);
    expect(hamburgerButton).toHaveAttribute('aria-expanded', 'false');
  });

  it('closes mobile menu when Escape key is pressed', async () => {
    render(<Navigation />);
    const hamburgerButton = screen.getByLabelText('Open menu');
    
    fireEvent.click(hamburgerButton);
    expect(hamburgerButton).toHaveAttribute('aria-expanded', 'true');

    fireEvent.keyDown(document, { key: 'Escape' });

    await waitFor(() => {
      expect(hamburgerButton).toHaveAttribute('aria-expanded', 'false');
    });
  });

  it('closes mobile menu when clicking outside', async () => {
    render(<Navigation />);
    const hamburgerButton = screen.getByLabelText('Open menu');
    
    fireEvent.click(hamburgerButton);
    expect(hamburgerButton).toHaveAttribute('aria-expanded', 'true');

    fireEvent.mouseDown(document.body);

    await waitFor(() => {
      expect(hamburgerButton).toHaveAttribute('aria-expanded', 'false');
    });
  });

  it('closes mobile menu when a link is clicked', () => {
    render(<Navigation />);
    const hamburgerButton = screen.getByLabelText('Open menu');
    
    fireEvent.click(hamburgerButton);
    expect(hamburgerButton).toHaveAttribute('aria-expanded', 'true');

    const productLink = screen.getByText('Product');
    fireEvent.click(productLink);

    expect(hamburgerButton).toHaveAttribute('aria-expanded', 'false');
  });

  it('has proper accessibility attributes', () => {
    render(<Navigation />);
    
    const hamburgerButton = screen.getByLabelText('Open menu');
    expect(hamburgerButton).toHaveAttribute('aria-expanded', 'false');
    expect(hamburgerButton).toHaveAttribute('aria-controls', 'mobile-menu');
  });

  it('sets data-testid when provided', () => {
    render(<Navigation testId="test-nav" />);
    expect(screen.getByTestId('test-nav')).toBeInTheDocument();
  });

  it('has proper semantic HTML structure', () => {
    render(<Navigation />);
    
    const nav = screen.getByRole('navigation');
    expect(nav.tagName).toBe('NAV');
  });

  it('navigation links have correct href attributes', () => {
    render(<Navigation />);
    
    const productLink = screen.getByText('Product').closest('a');
    const workflowLink = screen.getByText('Workflow').closest('a');
    const complianceLink = screen.getByText('Compliance').closest('a');

    expect(productLink).toHaveAttribute('href', '#product');
    expect(workflowLink).toHaveAttribute('href', '#workflow');
    expect(complianceLink).toHaveAttribute('href', '#compliance');
  });

  it('logo has aria-label for accessibility', () => {
    render(<Navigation />);
    const logo = screen.getAllByLabelText('Freightpilot Home')[0];
    expect(logo).toBeInTheDocument();
  });

  it('hamburger button has proper aria-label', () => {
    render(<Navigation />);
    const hamburgerButton = screen.getByLabelText('Open menu');
    expect(hamburgerButton).toHaveAttribute('aria-label', 'Open menu');
  });

  it('mobile menu has proper role and aria-label', () => {
    render(<Navigation />);
    const hamburgerButton = screen.getByLabelText('Open menu');
    
    fireEvent.click(hamburgerButton);

    const mobileMenu = screen.getByRole('navigation', { hidden: true });
    expect(mobileMenu).toHaveAttribute('aria-label', 'Mobile navigation menu');
  });
});
