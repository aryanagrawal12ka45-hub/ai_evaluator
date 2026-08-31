"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught Client Error Boundary caught exception:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div
          role="alert"
          aria-live="assertive"
          className="min-h-[400px] flex flex-col items-center justify-center p-8 text-center space-y-4 bg-[#1E222A] border border-[#C4432B]/40 rounded-xl my-8 text-[#E8E4D8]"
        >
          <div className="w-12 h-12 rounded-full bg-[#C4432B]/20 flex items-center justify-center text-[#C4432B]">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-display font-bold uppercase tracking-tight text-[#E8E4D8]">
            An unexpected dossier rendering error occurred
          </h2>
          <p className="text-xs font-mono text-white/70 max-w-md">
            {this.state.error?.message || "Client Component Exception"}
          </p>
          <button
            onClick={this.handleReset}
            className="px-5 py-2.5 bg-[#3E7CB1] text-[#E8E4D8] text-xs font-mono font-bold uppercase rounded shadow hover:bg-[#326490] transition-all flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" /> Reload Dossier View
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
