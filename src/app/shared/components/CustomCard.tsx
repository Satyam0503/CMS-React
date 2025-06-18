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
      sx={{ minHeight: "250px", height: "100%" }}
      className="p-4 d-flex flex-column"
    >
      <Stack spacing={1} className="flex-grow-1">
        <Stack direction="row" className="justify-content-between ">
          <Typography variant="h4" sx={{ fontSize: 16 }}>{props.label}</Typography>
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
