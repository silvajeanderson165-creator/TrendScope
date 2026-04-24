import { Component, type ReactNode } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#070B14] px-4">
          <div className="text-center max-w-md">
            <div className="inline-flex p-4 rounded-2xl bg-[rgba(56,189,248,0.08)] border border-[rgba(56,189,248,0.15)] mb-6">
              <AlertTriangle className="w-10 h-10 text-[#38BDF8]" />
            </div>
            <h1 className="text-2xl font-bold text-[#F0F9FF] mb-2">
              Algo deu errado
            </h1>
            <p className="text-[#94A3B8] mb-6 text-sm">
              Ocorreu um erro inesperado. Nossa equipe foi notificada.
              Tente recarregar a página.
            </p>
            {this.state.error && (
              <div className="mb-6 p-3 rounded-lg bg-[#0D1520] border border-[rgba(56,189,248,0.06)] text-left">
                <p className="text-[#38BDF8] text-xs font-mono break-all">
                  {this.state.error.message}
                </p>
              </div>
            )}
            <button
              onClick={this.handleReset}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#38BDF8] hover:bg-[#0EA5E9] text-[#070B14] font-medium transition-colors duration-200"
            >
              <RotateCcw className="w-4 h-4" />
              Recarregar
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
