'use client';

import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[ ERROR BOUNDARY ]', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="flex min-h-[200px] items-center justify-center p-4">
          <div className="text-center">
            <div className="mb-2 font-mono text-red-500">[ ERROR ]</div>
            <p className="text-sm text-muted-foreground">
              {this.state.error?.message || 'Something went wrong'}
            </p>
            <button
              onClick={() => this.setState({ hasError: false })}
              className="mt-4 rounded-none border border-primary px-4 py-2 font-mono text-sm hover:bg-primary hover:text-background transition-colors"
            >
              [ RETRY ]
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
