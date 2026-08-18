import { Card, Stack, Typography } from "@mui/material";
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
      sx={{ minHeight: applyMinHeight ? "310px" : "auto" }}
      className={clsx("p-4 d-flex flex-column", {
        "h-100": fillHeight,
      })}
    >
      <Stack spacing={1} className="flex-grow-1 ">
        <Stack direction="row" className="justify-content-between mb-1">
          <Typography className="fw-bold fs-16">{label}</Typography>
          {value ? (
            <Typography className="fs-16 fw-bold">{value}</Typography>
          ) : (
            ""
          )}
        </Stack>
        {children}
      </Stack>
    </Card>
  );
};
