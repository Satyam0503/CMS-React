import { Card, Stack, Typography } from "@mui/material";
import { FC } from "react";

interface Props {
  label: string;
  children: React.ReactNode;
  value?: number;
}

export const CustomCard: FC<Props> = (props) => {
  return (
    <Card sx={{ p: 2, minHeight:"200px",height:"100%", display:"flex",flexDirection:"column" }}>
      <Stack spacing={1} sx={{ flexGrow: 1 }}>
        <Stack direction="row" sx={{ justifyContent: "space-between" }}>
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
