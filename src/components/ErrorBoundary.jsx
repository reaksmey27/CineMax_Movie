import React from "react";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
          <div className="text-center max-w-md">
            <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <ExclamationTriangleIcon className="h-10 w-10 text-red-500" />
            </div>
            <h1 className="text-3xl font-black text-white mb-4 uppercase tracking-tighter">
              Something went wrongs
            </h1>
            <p className="text-gray-400 mb-8">
              We encountered an unexpected error. Please try refreshing the page
              or return to the homepage.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="px-8 py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-500 transition-all"
              >
                Refresh Page
              </button>
              <button
                onClick={() => this.setState({ hasError: false, error: null })}
                className="px-8 py-3 bg-white/5 border border-white/10 text-white rounded-xl font-bold hover:bg-white/10 transition-all"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
