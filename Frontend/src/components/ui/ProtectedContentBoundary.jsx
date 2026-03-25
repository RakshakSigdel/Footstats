import { Component } from "react";
import { useLocation } from "react-router-dom";

class ProtectedContentBoundaryImpl extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    console.error("Protected route content crashed:", error);
  }

  componentDidUpdate(prevProps) {
    const routeChanged = prevProps.locationKey !== this.props.locationKey;
    if (routeChanged && this.state.hasError) {
      this.setState({ hasError: false });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 md:p-8">
          <div className="app-card max-w-2xl space-y-3 p-6">
            <h2 className="text-xl font-semibold text-slate-900">This page hit an error</h2>
            <p className="text-sm text-slate-500">
              Try another page from the sidebar. This section will reset automatically when you navigate.
            </p>
            <button className="btn-primary px-4 py-2 text-sm" onClick={() => this.setState({ hasError: false })}>
              Retry this page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default function ProtectedContentBoundary({ children }) {
  const location = useLocation();

  return (
    <ProtectedContentBoundaryImpl locationKey={`${location.pathname}${location.search}`}>
      {children}
    </ProtectedContentBoundaryImpl>
  );
}