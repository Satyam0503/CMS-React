import { Alert, Button } from "@mui/material";
import { useIntl } from "react-intl";

type DashboardOverviewErrorProps = {
  onRetry: () => void;
  isRetrying?: boolean;
};

export const DashboardOverviewError = ({ onRetry, isRetrying = false }: DashboardOverviewErrorProps) => {
  const { formatMessage } = useIntl();

  return (
    <Alert
      severity="error"
      role="alert"
      action={(
        <Button color="inherit" size="small" onClick={onRetry} disabled={isRetrying}>
          {formatMessage({ id: isRetrying ? "DASHBOARD.RETRYING" : "DASHBOARD.RETRY" })}
        </Button>
      )}
    >
      {formatMessage({ id: "DASHBOARD.LOAD_ERROR" })}
    </Alert>
  );
};
