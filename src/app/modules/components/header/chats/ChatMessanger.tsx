import * as React from "react";

import {
  Button,
  Card,
  Container,
  Grid,
  Link,
  Stack,
  Typography,
} from "@mui/material";

import { Add, Circle, Close, MoreHoriz } from "@mui/icons-material";
import { CustomIconButton } from "../../CustomIconButton";

export default function ChatMessenger() {
  return (
    <>
      <Stack>
        <Stack
          direction={"row"}
          display={"flex"}
          justifyContent={"space-between"}
        >
          <Stack>
            <Link href="#">
              <Typography variant="h5">Brian Cox</Typography>
            </Link>
            <Stack direction={"row"} spacing={1}>
              <Circle color="success" />
              <Typography variant="body2">Active</Typography>
            </Stack>
          </Stack>

          <Stack direction={"row"} spacing={1}>
            <CustomIconButton icon={<MoreHoriz />} />
            <CustomIconButton icon={<Close />} />
          </Stack>
        </Stack>
      </Stack>
    </>
  );
}
