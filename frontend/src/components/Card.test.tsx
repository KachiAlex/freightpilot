import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Card } from './Card';

describe('Card Component', () => {
  it('renders children correctly', () => {
    render(
      <Card>
        <h3>Test Title</h3>
        <p>Test content</p>
      </Card>
    );

    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <Card className="custom-class">
        Content
      </Card>
    );

    const cardElement = container.querySelector('div');
    expect(cardElement).toHaveClass('custom-class');
  });

  it('applies default styling classes', () => {
    const { container } = render(
      <Card>
        Content
      </Card>
    );

    const cardElement = container.querySelector('div');
    expect(cardElement).toHaveClass('rounded-md');
    expect(cardElement).toHaveClass('p-lg');
    expect(cardElement).toHaveClass('bg-neutral-white');
    expect(cardElement).toHaveClass('border');
    expect(cardElement).toHaveClass('border-neutral-border');
    expect(cardElement).toHaveClass('shadow-card-default');
  });

  it('applies hover classes', () => {
    const { container } = render(
      <Card>
        Content
      </Card>
    );

    const cardElement = container.querySelector('div');
    expect(cardElement).toHaveClass('hover:shadow-card-hover');
    expect(cardElement).toHaveClass('hover:-translate-y-1');
  });

  it('handles click events when onClick is provided', () => {
    const handleClick = jest.fn();
    render(
      <Card onClick={handleClick}>
        Clickable Card
      </Card>
    );

    const cardElement = screen.getByRole('button');
    fireEvent.click(cardElement);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('handles keyboard Enter key when onClick is provided', () => {
    const handleClick = jest.fn();
    render(
      <Card onClick={handleClick}>
        Clickable Card
      </Card>
    );

    const cardElement = screen.getByRole('button');
    fireEvent.keyDown(cardElement, { key: 'Enter' });

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('handles keyboard Space key when onClick is provided', () => {
    const handleClick = jest.fn();
    render(
      <Card onClick={handleClick}>
        Clickable Card
      </Card>
    );

    const cardElement = screen.getByRole('button');
    fireEvent.keyDown(cardElement, { key: ' ' });

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('sets cursor-pointer when onClick is provided', () => {
    const { container } = render(
      <Card onClick={() => {}}>
        Clickable Card
      </Card>
    );

    const cardElement = container.querySelector('div');
    expect(cardElement).toHaveClass('cursor-pointer');
  });

  it('does not set cursor-pointer when onClick is not provided', () => {
    const { container } = render(
      <Card>
        Non-clickable Card
      </Card>
    );

    const cardElement = container.querySelector('div');
    expect(cardElement).not.toHaveClass('cursor-pointer');
  });

  it('sets tabIndex when onClick is provided', () => {
    const { container } = render(
      <Card onClick={() => {}}>
        Clickable Card
      </Card>
    );

    const cardElement = container.querySelector('div');
    expect(cardElement).toHaveAttribute('tabIndex', '0');
  });

  it('sets data-testid when provided', () => {
    render(
      <Card testId="test-card">
        Content
      </Card>
    );

    const cardElement = screen.getByTestId('test-card');
    expect(cardElement).toBeInTheDocument();
  });

  it('ignores other keys when onClick is provided', () => {
    const handleClick = jest.fn();
    render(
      <Card onClick={handleClick}>
        Clickable Card
      </Card>
    );

    const cardElement = screen.getByRole('button');
    fireEvent.keyDown(cardElement, { key: 'a' });

    expect(handleClick).not.toHaveBeenCalled();
  });

  it('has proper accessibility attributes when clickable', () => {
    const { container } = render(
      <Card onClick={() => {}}>
        Clickable Card
      </Card>
    );

    const cardElement = container.querySelector('div');
    expect(cardElement).toHaveAttribute('role', 'button');
    expect(cardElement).toHaveAttribute('tabIndex', '0');
  });

  it('does not have role button when not clickable', () => {
    const { container } = render(
      <Card>
        Non-clickable Card
      </Card>
    );

    const cardElement = container.querySelector('div');
    expect(cardElement).not.toHaveAttribute('role', 'button');
  });
});
