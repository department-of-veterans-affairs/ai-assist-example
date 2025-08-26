import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SmartLaunchProvider } from '@/providers/smart-launch-provider';

// Mock the useSmartLaunch hook
vi.mock('@/hooks/use-smart-launch', () => ({
  useSmartLaunch: vi.fn(),
}));

import { useSmartLaunch } from '@/hooks/use-smart-launch';

describe('SmartLaunchProvider', () => {
  const mockConsoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {
    // Intentionally empty - suppressing console.warn in tests
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mockConsoleWarn.mockClear();
  });

  it('should show loading message when SMART launch is initializing', () => {
    (useSmartLaunch as ReturnType<typeof vi.fn>).mockReturnValue({
      loading: true,
      error: null,
      client: null,
    });

    render(
      <SmartLaunchProvider>
        <div>Test Content</div>
      </SmartLaunchProvider>
    );

    expect(screen.getByText('Initializing SMART on FHIR')).toBeInTheDocument();
    expect(screen.queryByText('Test Content')).not.toBeInTheDocument();
  });

  it('should render children when loading is complete and no error', () => {
    (useSmartLaunch as ReturnType<typeof vi.fn>).mockReturnValue({
      loading: false,
      error: null,
      client: {},
    });

    render(
      <SmartLaunchProvider>
        <div>Test Content</div>
      </SmartLaunchProvider>
    );

    expect(screen.getByText('Test Content')).toBeInTheDocument();
    expect(
      screen.queryByText('Initializing SMART on FHIR')
    ).not.toBeInTheDocument();
  });

  it('should render children and log warning when error occurs in development', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    (useSmartLaunch as ReturnType<typeof vi.fn>).mockReturnValue({
      loading: false,
      error: 'Test error message',
      client: null,
    });

    render(
      <SmartLaunchProvider>
        <div>Test Content</div>
      </SmartLaunchProvider>
    );

    expect(screen.getByText('Test Content')).toBeInTheDocument();
    expect(mockConsoleWarn).toHaveBeenCalledWith(
      'SMART launch error:',
      'Test error message',
      '- continuing with app for local development'
    );

    process.env.NODE_ENV = originalEnv;
  });

  it('should not log warning when error occurs in production', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';

    (useSmartLaunch as ReturnType<typeof vi.fn>).mockReturnValue({
      loading: false,
      error: 'Test error message',
      client: null,
    });

    render(
      <SmartLaunchProvider>
        <div>Test Content</div>
      </SmartLaunchProvider>
    );

    expect(screen.getByText('Test Content')).toBeInTheDocument();
    expect(mockConsoleWarn).not.toHaveBeenCalled();

    process.env.NODE_ENV = originalEnv;
  });

  it('should not log warning when no error occurs', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    (useSmartLaunch as ReturnType<typeof vi.fn>).mockReturnValue({
      loading: false,
      error: null,
      client: {},
    });

    render(
      <SmartLaunchProvider>
        <div>Test Content</div>
      </SmartLaunchProvider>
    );

    expect(screen.getByText('Test Content')).toBeInTheDocument();
    expect(mockConsoleWarn).not.toHaveBeenCalled();

    process.env.NODE_ENV = originalEnv;
  });

  it('should use VACDS utility classes for loading state', () => {
    (useSmartLaunch as ReturnType<typeof vi.fn>).mockReturnValue({
      loading: true,
      error: null,
      client: null,
    });

    const { container } = render(
      <SmartLaunchProvider>
        <div>Test Content</div>
      </SmartLaunchProvider>
    );

    const loadingDiv = container.querySelector('.padding-3.text-center');
    expect(loadingDiv).toBeInTheDocument();
  });
});
