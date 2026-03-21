import { Component } from "react";
import { motion } from "framer-motion";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    console.error("UI crashed:", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="app-shell grid min-h-screen place-items-center p-6">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            className="app-card max-w-lg space-y-3 p-6 text-center"
          >
            <h2 className="text-xl font-semibold">Something went wrong</h2>
            <p className="text-sm text-slate-500">
              This screen hit an error. Refresh to recover.
            </p>
            <button className="btn-primary px-4 py-2 text-sm" onClick={() => window.location.reload()}>
              Reload app
            </button>
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}

