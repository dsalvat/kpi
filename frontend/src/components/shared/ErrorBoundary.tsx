import { Component, type ReactNode } from "react";
import { AlertCircle } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="card flex flex-col items-center justify-center border-l-[3px] border-l-danger p-8 text-center">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-danger-light">
              <AlertCircle className="h-5 w-5 text-danger" strokeWidth={1.8} />
            </div>
            <p className="text-sm font-medium text-text-primary">
              Hi ha hagut un error inesperat
            </p>
            <button
              className="mt-3 rounded-lg bg-secondary px-4 py-1.5 text-[13px] font-medium text-white transition-colors hover:bg-secondary-light"
              onClick={() => this.setState({ hasError: false })}
            >
              Tornar a intentar
            </button>
          </div>
        )
      );
    }
    return this.props.children;
  }
}
