import { Card, Stack, Typography } from "@mui/material";
import { FC } from "react";

interface Props {
  label: string;
  children: React.ReactNode;
  value?: any;
}

export const CustomCard: FC<Props> = (props) => {
  return (
    <Card
      sx={{ minHeight: "310px" }}
      className="p-4 d-flex flex-column"
    >
      <Stack spacing={1} className="flex-grow-1 ">
        <Stack direction="row" className="justify-content-between mb-1">
          <Typography className="fw-bold fs-16">{props.label}</Typography>
          {props.value ? (
            <Typography className="fs-16 fw-bold">{props.value}</Typography>
          ) : (
            ""
          )}
        </Stack>
        {props.children}
      </Stack>
    </Card>
  );
};
