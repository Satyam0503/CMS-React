import { alpha, Box, Card, Stack, Typography } from "@mui/material";
import clsx from "clsx";
import { FC } from "react";

interface Props {
  label: string;
  children: React.ReactNode;
  value?: number | string;
  applyMinHeight?: boolean;
  fillHeight?: boolean;
}

export const CustomCard: FC<Props> = (props) => {
  const { label, children, value, applyMinHeight = true, fillHeight = false } = props;
  return (
    <Card
      sx={{
        minHeight: applyMinHeight ? "310px" : "auto",
        position: "relative",
      }}
      className={clsx("p-4 d-flex flex-column", {
        "h-100": fillHeight,
      })}
    >
      <Stack spacing={1.75} className="flex-grow-1" sx={{ position: "relative", zIndex: 1 }}>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{
            pb: 1.25,
            borderBottom: "1px solid",
            borderColor: "divider",
          }}
        >
          <Typography
            sx={{
              fontWeight: 700,
              fontSize: "0.95rem",
              letterSpacing: "-0.015em",
              color: "text.primary",
            }}
          >
            {label}
          </Typography>
          {value !== undefined && value !== "" ? (
            <Box
              sx={{
                minWidth: 26,
                height: 24,
                px: 1,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "8px",
                backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.12),
                border: "1px solid",
                borderColor: (theme) => alpha(theme.palette.primary.main, 0.25),
                WebkitBackdropFilter: "blur(6px)",
                backdropFilter: "blur(6px)",
                fontWeight: 700,
                fontSize: "0.75rem",
                color: "primary.main",
                lineHeight: 1,
              }}
            >
              {value}
            </Box>
          ) : null}
        </Stack>
        {children}
      </Stack>
    </Card>
  );
};

