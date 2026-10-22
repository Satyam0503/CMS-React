import React from "react";
import { Box, Button, Typography } from "@mui/material";

interface PropsTypes {
  children: React.ReactNode;
}
interface StateType {
  hasError: boolean;
  error?: Error;
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
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error("ErrorBoundary caught error:", error, errorInfo);
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      return (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100vh",
            p: 3,
            textAlign: "center",
            bgcolor: "background.default",
            color: "text.primary",
          }}
        >
          <Typography variant="h4" fontWeight={750} gutterBottom>
            Something went wrong
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2, maxWidth: 500 }}>
            An unexpected error occurred while displaying this page.
          </Typography>
          {this.state.error && (
            <Box
              component="pre"
              sx={{
                p: 2,
                mb: 3,
                maxWidth: 800,
                maxHeight: 250,
                overflow: "auto",
                textAlign: "left",
                fontSize: "0.8rem",
                bgcolor: "grey.100",
                color: "error.dark",
                border: "1px solid",
                borderColor: "error.light",
                borderRadius: 2,
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
              }}
            >
              {this.state.error.toString()}
              {"\n"}
              {this.state.error.stack}
            </Box>
          )}
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              this.setState({ hasError: false, error: undefined });
              window.location.reload();
            }}
            sx={{ textTransform: "none", fontWeight: 700, borderRadius: 2, px: 3, py: 1 }}
          >
            Reload Page
          </Button>
        </Box>
      );
    }
    return this.props.children;
  }
}

export { ErrorBoundary };
