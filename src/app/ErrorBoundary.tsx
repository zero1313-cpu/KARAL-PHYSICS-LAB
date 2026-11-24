import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface State { failed: boolean }

export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('KARAL PHYSICS LAB screen error', error, info.componentStack);
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <main className="mx-auto flex min-h-[70vh] max-w-lg flex-col items-center justify-center gap-4 p-6 text-center">
        <AlertTriangle className="h-12 w-12 text-amber-500" />
        <h1 className="text-xl font-bold">Something went wrong</h1>
        <p className="text-sm opacity-75">The screen could not be loaded. Your saved data is safe.</p>
        <button className="btn btn-primary" onClick={() => this.setState({ failed: false })}>
          <RefreshCw className="h-4 w-4" /> Reload screen
        </button>
      </main>
    );
  }
}
