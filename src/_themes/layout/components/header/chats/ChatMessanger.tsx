import * as React from "react";

import { Divider, Link, Stack, Typography } from "@mui/material";

import { Circle, Close } from "@mui/icons-material";
import { CustomIconButton } from "../../../../../app/shared/components/CustomIconButton";

export default function ChatMessenger() {
  return (
    <Stack>
      <Stack
        direction={"row"}
        display={"flex"}
        justifyContent={"space-between"}
      >
        <Stack spacing={1}>
          <Link href="#">
            <Typography variant="h5">
              <Circle color="success" sx={{ mr: 1 }} />
              Brian Cox
            </Typography>
          </Link>
        </Stack>

        <Stack direction={"row"}>
          <CustomIconButton icon={<Close />} />
        </Stack>
      </Stack>
      <Divider sx={{ py: 1 }} />
    </Stack>
  );
}
