import { Card, Stack, Typography } from "@mui/material";
import { FC } from "react";

interface Props {
  label: string;
  children: React.ReactNode;
  value?: number;
}

export const CustomCard: FC<Props> = (props) => {
  return (
    <Card
      sx={{ p: 2, minHeight: "300px", height: "100%" }}
      className="d-flex flex-column"
    >
      <Stack spacing={1} className="flex-grow-1">
        <Stack direction="row" className="justify-content-between ">
          <Typography variant="h6">{props.label}</Typography>
          {props.value ? (
            <Typography variant="h4">{props.value}</Typography>
          ) : (
            ""
          )}
        </Stack>
        {props.children}
      </Stack>
    </Card>
  );
};
