import { Box, Typography } from "@mui/material";
import { FC } from "react";
import { useIntl } from "react-intl";

interface Props {
  title: string;
}

const CardMessage: FC<Props> = ({ title }) => {
  const { formatMessage } = useIntl();
  return (
    <Box className="d-flex flex-grow-1 align-items-center justify-content-center">
      <Typography
        variant="h4"
        className="fw-bold text-center text-wrap-balance"
      >
        {formatMessage({ id: title })}
      </Typography>
    </Box>
  );
};

export { CardMessage };
