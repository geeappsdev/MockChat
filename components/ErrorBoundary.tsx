
import React, { ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children?: ReactNode;
  fallback?: ReactNode;
  componentName?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

// Senior Audit Fix: Explicitly extending React.Component with type parameters to ensure TypeScript 
// correctly recognizes this as a React class component and provides access to inherited properties like props, state, and setState.
class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    // Explicitly initialize state using this.state
    this.state = {
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Accessing props via this.props to log component specific errors
    console.error(`Error in component ${this.props.componentName || 'Unknown'}:`, error, errorInfo);
  }

  render() {
    // Accessing state via this.state to determine if an error occurred
    if (this.state.hasError) {
      // Accessing props via this.props to render a custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/30 text-center animate-fade-in-up">
          <div className="text-red-500 dark:text-red-400 mb-1">
            <svg className="w-6 h-6 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-xs font-bold text-red-700 dark:text-red-300 uppercase tracking-wide">Component Error</h3>
          <p className="text-[10px] text-red-600 dark:text-red-400 mt-1">
            {this.props.componentName ? `${this.props.componentName} failed to render.` : 'Something went wrong.'}
          </p>
          <button 
            // Using this.setState to reset error state and allow for manual retry
            onClick={() => this.setState({ hasError: false, error: null })}
            className="mt-2 text-[10px] underline text-red-600 hover:text-red-800 dark:text-red-400"
          >
            Try to reload
          </button>
        </div>
      );
    }

    // Accessing props via this.props to render the child components normally
    return this.props.children; 
  }
}

export default ErrorBoundary;
