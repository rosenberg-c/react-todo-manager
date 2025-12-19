import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ButtonPrimary } from './ButtonPrimary';

describe('ButtonPrimary', () => {
  it('should render children', () => {
    render(<ButtonPrimary>Click me</ButtonPrimary>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('should render as a button element', () => {
    render(<ButtonPrimary>Click me</ButtonPrimary>);
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });

  it('should accept onClick handler', () => {
    let clicked = false;
    render(
      <ButtonPrimary onClick={() => (clicked = true)}>Click me</ButtonPrimary>
    );
    const button = screen.getByRole('button');
    button.click();
    expect(clicked).toBe(true);
  });

  it('should be disabled when disabled prop is true', () => {
    render(<ButtonPrimary disabled>Click me</ButtonPrimary>);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });
});
