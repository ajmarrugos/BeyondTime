import React, { Component, ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false
  };

  public static getDerivedStateFromError(_: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="w-screen h-screen flex flex-col items-center justify-center bg-slate-950 text-gray-300 font-sans p-4 text-center">
          <h1 className="text-3xl font-bold">Something went wrong.</h1>
          <p className="mt-4 text-lg">We're sorry for the inconvenience. Please try refreshing the page.</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 px-6 py-3 rounded-full text-lg font-semibold transition-all duration-200 bg-accent text-white hover:shadow-lg hover:shadow-accent/30"
          >
            Refresh
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;