import { FC } from "react";
import { Box, colors, Link, Stack, Typography } from "@mui/material";
import { CustomIconButton } from "../../../../app/modules/components/CustomIconButton";
import {
  Circle,
  Close,
  DoneTwoTone,
  Lens,
  MoreHoriz,
} from "@mui/icons-material";
import { InnerChat } from "../../../../app/modules/chats/InnerChat";

const DrawerMessenger: FC = () => (
  <Box
    id="kt_drawer_chat"
    data-kt-drawer-toggle="#kt_drawer_chat_toggle"
    data-kt-drawer="true"
    data-kt-drawer-activate="true"
    // className="bg-body"
    // data-kt-drawer-name="chat"
    // data-kt-drawer-overlay="true"
    data-kt-drawer-width="{default:'300px', 'md': '500px'}"
    // data-kt-drawer-direction="end"
    // data-kt-drawer-close="#kt_drawer_chat_close"
    sx={{ p: 2 }}
  >
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

      <InnerChat isDrawer={true} />
    </Stack>
  </Box>
);

export { DrawerMessenger };
