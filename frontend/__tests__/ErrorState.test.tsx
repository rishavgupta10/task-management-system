import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ErrorState } from '../components/ErrorState';

describe('Frontend Error State & Retry Behavior', () => {
  it('renders error message and triggers retry on button click', () => {
    const handleRetry = jest.fn();
    const customMessage = 'Failed to fetch tasks from server.';

    render(<ErrorState message={customMessage} onRetry={handleRetry} />);

    expect(screen.getByText('Unable to load tasks')).toBeInTheDocument();
    expect(screen.getByText(customMessage)).toBeInTheDocument();

    const retryButton = screen.getByRole('button', { name: /retry/i });
    expect(retryButton).toBeInTheDocument();

    fireEvent.click(retryButton);
    expect(handleRetry).toHaveBeenCalledTimes(1);
  });
});
