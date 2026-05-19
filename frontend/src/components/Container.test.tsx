import React from 'react';
import { render, screen } from '@testing-library/react';
import { Container } from './Container';

describe('Container Component', () => {
  it('renders children correctly', () => {
    render(
      <Container>
        <h1>Test Title</h1>
        <p>Test content</p>
      </Container>
    );

    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('applies default styling classes', () => {
    const { container } = render(
      <Container>
        Content
      </Container>
    );

    const containerElement = container.querySelector('div');
    expect(containerElement).toHaveClass('w-full');
    expect(containerElement).toHaveClass('mx-auto');
    expect(containerElement).toHaveClass('px-sm');
  });

  it('applies responsive padding classes', () => {
    const { container } = render(
      <Container>
        Content
      </Container>
    );

    const containerElement = container.querySelector('div');
    expect(containerElement).toHaveClass('mobile:px-sm');
    expect(containerElement).toHaveClass('tablet:px-md');
    expect(containerElement).toHaveClass('desktop:px-lg');
  });

  it('applies responsive max-width classes', () => {
    const { container } = render(
      <Container>
        Content
      </Container>
    );

    const containerElement = container.querySelector('div');
    expect(containerElement).toHaveClass('max-w-full');
    expect(containerElement).toHaveClass('tablet:max-w-container-tablet');
    expect(containerElement).toHaveClass('desktop:max-w-container-desktop');
  });

  it('applies custom className', () => {
    const { container } = render(
      <Container className="custom-class">
        Content
      </Container>
    );

    const containerElement = container.querySelector('div');
    expect(containerElement).toHaveClass('custom-class');
  });

  it('centers content with margin auto', () => {
    const { container } = render(
      <Container>
        Content
      </Container>
    );

    const containerElement = container.querySelector('div');
    expect(containerElement).toHaveClass('mx-auto');
  });

  it('sets data-testid when provided', () => {
    render(
      <Container testId="test-container">
        Content
      </Container>
    );

    const containerElement = screen.getByTestId('test-container');
    expect(containerElement).toBeInTheDocument();
  });

  it('combines custom className with default classes', () => {
    const { container } = render(
      <Container className="bg-blue-500">
        Content
      </Container>
    );

    const containerElement = container.querySelector('div');
    expect(containerElement).toHaveClass('w-full');
    expect(containerElement).toHaveClass('mx-auto');
    expect(containerElement).toHaveClass('bg-blue-500');
  });

  it('renders as a div element', () => {
    const { container } = render(
      <Container>
        Content
      </Container>
    );

    const containerElement = container.querySelector('div');
    expect(containerElement?.tagName).toBe('DIV');
  });

  it('maintains semantic structure with nested elements', () => {
    render(
      <Container>
        <header>Header</header>
        <main>Main content</main>
        <footer>Footer</footer>
      </Container>
    );

    expect(screen.getByText('Header')).toBeInTheDocument();
    expect(screen.getByText('Main content')).toBeInTheDocument();
    expect(screen.getByText('Footer')).toBeInTheDocument();
  });
});
