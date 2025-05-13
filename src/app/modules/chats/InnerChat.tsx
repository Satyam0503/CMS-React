import { FC, useState } from "react";

import CustomisedButton from "../../shared/components/CustomisedButton";
import { CustomIconButton } from "../../shared/components/CustomIconButton";
import {
  AccountCircle,
  AttachFile,
  DisplaySettings,
  Send,
  Upload,
  Visibility,
} from "@mui/icons-material";
import {
  Avatar,
  FilledInput,
  FormControl,
  IconButton,
  Input,
  InputAdornment,
  InputLabel,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { relative } from "path";

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
        <Stack spacing={2} overflow={"visible"} minHeight={"83vh"}>
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
              <Stack
                flexWrap={"wrap"}
                borderRadius={0.5}
                p={2}
              >
                <Typography variant="body1">
                  Hey Prachi, I just finished the code for the new feature. Do
                  you have a moment to review it?
                </Typography>
              </Stack>
            </Stack>
            <Stack
              flexWrap={"wrap"}
              borderRadius={0.5}
              p={2}
            >
              <Typography variant="body1">
                Hey Prachi, I just finished the code for the new feature. Do you
                have a moment to review it?
              </Typography>
            </Stack>
          </Stack>
          <Stack spacing={2}>
            <Stack direction={"row"} spacing={2}>
              <Stack
                flexWrap={"wrap"}
                borderRadius={0.5}
                p={2}
              >
                <Typography variant="body1">
                  Hey Prachi, I just finished the code for the new feature. Do
                  you have a moment to review it?
                </Typography>
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
            <Stack
              flexWrap={"wrap"}
              borderRadius={0.5}
              p={2}
            >
              <Typography variant="body1">
                Hey Prachi, I just finished the code for the new feature. Do you
                have a moment to review it?
              </Typography>
            </Stack>
            <Stack
              flexWrap={"wrap"}
              borderRadius={0.5}
              p={2}
            >
              <Typography variant="body1">
                Hey Prachi, I just finished the code for the new feature. Do you
                have a moment to review it?
              </Typography>
            </Stack>
          </Stack>
        </Stack>

        <Stack width={"100%"}>
          {/* <TextField fullWidth placeholder="Type a message" /> */}
          <FormControl variant="filled">
            <InputLabel htmlFor="input-with-icon-adornment">
              Type your message here
            </InputLabel>
            <FilledInput
              id="filled-adornment-password"
              type="text"
              endAdornment={
                <InputAdornment position="end">
                  <Send />
                </InputAdornment>
              }
            />
          </FormControl>
          {/* 
          <Stack direction={"row"} justifyContent={"flex-end"}>
            <CustomIconButton icon={<AttachFile />} tooltip="Attach file" />
            <CustomIconButton icon={<Upload />} tooltip="Upload" />
            <CustomisedButton variant="contained" type="button" label="Send" />
          </Stack> */}
        </Stack>
      </Stack>
    </>
  );
};

export { InnerChat };
