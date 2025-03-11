import React from "react";
import { UnAuthorizedAccess } from "./UnAuthorizedAccess";

interface PropsTypes {
  children: React.ReactNode;
}
interface StateType {
  hasError: boolean;
}
class ErrorBoundary extends React.Component<PropsTypes, StateType> {
  constructor(props: PropsTypes) {
    super(props);
    this.state = {
      hasError: false,
    };
  }
  // set error state if any error occur during rendering
  static getDerivedStateFromError(error: any) {
    return {
      hasError: true,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.log(error);
    console.log(errorInfo);
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      return <UnAuthorizedAccess type="error" />;
    }
    return this.props.children;
  }
}

export { ErrorBoundary };
