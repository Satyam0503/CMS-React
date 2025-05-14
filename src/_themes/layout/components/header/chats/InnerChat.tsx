import { FC, useState } from "react";

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
  Box,
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
import { wrap } from "module";

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
        <Stack spacing={2} minHeight={"83vh"} py={4}>
          <Stack spacing={0.5}>
            <Stack direction={"row"} spacing={1} alignItems={"center"}>
              <Box width="40px" height="40px">
                <Avatar
                  alt="profile picture"
                  src="media/avatars/300-6.jpg"
                  sx={{
                    height: "100%",
                    position: "relative",
                  }}
                />
              </Box>
              <Stack
                bgcolor="primary.light"
                flexWrap={"wrap"}
                borderRadius={8}
                p={1.5}
              >
                <Typography variant="body1" className="text-wrap">
                  Hey Prachi, I just finished the code for the new feature.
                </Typography>
              </Stack>
            </Stack>
            <Stack
              bgcolor="primary.light"
              flexWrap={"wrap"}
              borderRadius={8}
              p={1.5}
            >
              <Typography variant="body1">
                Hey Prachi, I just finished the code for the new feature. Do you
                have a moment to review it?
              </Typography>
            </Stack>
          </Stack>
          <Stack spacing={0.5}>
            <Stack direction={"row"} spacing={1} alignItems={"center"}>
              <Stack
                bgcolor="primary.light"
                flexWrap={"wrap"}
                borderRadius={8}
                p={1.5}
              >
                <Typography variant="body1" className="text-wrap">
                  Hey Prachi, I just finished the code for the new feature.
                </Typography>
              </Stack>
              <Box width="40px" height="40px">
                <Avatar
                  alt="profile picture"
                  src="media/avatars/300-1.jpg"
                  sx={{
                    height: "100%",
                    position: "relative",
                  }}
                />
              </Box>
            </Stack>
            <Stack
              bgcolor="primary.light"
              flexWrap={"wrap"}
              borderRadius={8}
              p={1.5}
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
