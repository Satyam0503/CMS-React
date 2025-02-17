import { FC, useState } from "react";

import CustomisedButton from "../../../app/modules/components/CustomisedButton";
import { CustomIconButton } from "../../../app/modules/components/CustomIconButton";
import { AttachFile, DisplaySettings, Upload } from "@mui/icons-material";
import { Avatar, Stack, TextField } from "@mui/material";
import { colors } from "../theme/MuiTheme";

type Props = {
  isDrawer?: boolean;
};

const InnerChat: FC<Props> = ({ isDrawer = false }) => {
  const [message, setMessage] = useState<string>("");

  return (
    <>
      <Stack
        display={"flex"}
        flexDirection={"column"}
        justifyContent={"space-between"}
        spacing={2}
      >
        <Stack spacing={2}>
          <Stack spacing={2}>
            <Stack direction={"row"} spacing={2}>
              <Stack width={"120px"}>
                <Avatar
                  alt="profile picture"
                  src="media/avatars/300-1.jpg"
                  sx={{
                    width: "100%",
                    height: "100%",
                  }}
                />
              </Stack>
              <Stack bgcolor={colors.alpha.primary[300]} flexWrap={"wrap"}>
                Hey Prachi, I just finished the code for the new feature. Do you
                have a moment to review it?
              </Stack>
            </Stack>
            <Stack bgcolor={colors.alpha.primary[100]} flexWrap={"wrap"}>
              Hey Prachi, I just finished the code for the new feature. Do you
              have a moment to review it?
            </Stack>
          </Stack>
          <Stack spacing={2}>
            <Stack direction={"row"} spacing={2}>
              <Stack bgcolor={colors.alpha.primary[300]} flexWrap={"wrap"}>
                Hey Prachi, I just finished the code for the new feature. Do you
                have a moment to review it?
              </Stack>
              <Stack width={"120px"}>
                <Avatar
                  alt="profile picture"
                  src="media/avatars/300-1.jpg"
                  sx={{
                    width: "100%",
                    height: "100%",
                  }}
                />
              </Stack>
            </Stack>
            <Stack bgcolor={colors.alpha.primary[100]} flexWrap={"wrap"}>
              Hey Prachi, I just finished the code for the new feature. Do you
              have a moment to review it?
            </Stack>
          </Stack>
        </Stack>

        <Stack width={"100%"}>
          <TextField fullWidth placeholder="Type a message" />

          <Stack direction={"row"} justifyContent={"flex-end"}>
            <CustomIconButton icon={<AttachFile />} tooltip="Attach file" />
            <CustomIconButton icon={<Upload />} tooltip="Upload" />
            <CustomisedButton variant="contained" type="button" label="Send" />
          </Stack>
        </Stack>
      </Stack>
    </>
  );
};

export { InnerChat };
