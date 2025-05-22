import { FC, useState } from "react";
type Props = {
  isDrawer?: boolean;
  contact: { name: string };
  goBack: () => void;
};

import {
  ArrowBack,
  Circle,
  Close,
  KeyboardArrowLeft,
  Send,
} from "@mui/icons-material";
import {
  Avatar,
  Box,
  Divider,
  FilledInput,
  FormControl,
  InputAdornment,
  InputLabel,
  Link,
  Stack,
  Typography,
} from "@mui/material";
import { CustomIconButton } from "../../../../../app/shared/components/CustomIconButton";

const InnerChat: FC<Props> = ({ isDrawer = false, contact, goBack }) => {
  const [message, setMessage] = useState<string>("");

  return (
    <>
      <Stack>
        <Stack
          direction={"row"}
          display={"flex"}
          justifyContent={"space-between"}
        >
          <Stack spacing={1}>
            <Typography variant="h5">
              <Circle color="success" sx={{ mr: 1 }} />
              Brian Cox
            </Typography>
          </Stack>

          <Stack direction={"row"}>
            <CustomIconButton
              icon={<KeyboardArrowLeft />}
              handleClick={goBack}
            />
          </Stack>
        </Stack>
        <Divider sx={{ py: 1 }} />
      </Stack>
      <Stack
        display={"flex"}
        flexDirection={"column"}
        justifyContent={"space-between"}
        spacing={2}
      >
        <Stack spacing={1} minHeight={"83vh"} py={4}>
          <Stack spacing={0.5} direction="row" alignItems="end">
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
            <Stack spacing={0.25} alignItems={"start"}>
              <Box
                component="span"
                bgcolor="primary.light"
                flexWrap={"wrap"}
                borderRadius="1.5rem 1.5rem 1.5rem.25rem"
                px={1.5}
                py={1}
              >
                <Typography variant="body1" className="text-wrap">
                  Hey Prachi ccccccccccccccccccccc
                </Typography>
              </Box>
              <Box
                component="span"
                bgcolor="primary.main"
                flexWrap="wrap"
                borderRadius=".25rem 1.25rem 1.5rem .25rem"
                px={1.5}
                py={1}
              >
                <Typography variant="body1">Hey Prachi</Typography>
              </Box>
              <Box
                component="span"
                bgcolor="primary.main"
                flexWrap="wrap"
                borderRadius=".25rem 1.25rem 1.5rem 1.5rem"
                px={1.5}
                py={1}
              >
                <Typography variant="body1">
                  Hey Prachi, , how are u ?
                </Typography>
              </Box>
            </Stack>
          </Stack>
          <Stack
            spacing={0.5}
            direction="row"
            justifyContent="end"
            alignItems="end"
          >
            <Stack spacing={0.25} alignItems={"end"} justifyContent={"end"}>
              <Box
                component="span"
                bgcolor="primary.light"
                flexWrap={"wrap"}
                borderRadius="1.5rem 1.5rem .25rem 1.5rem"
                px={1.5}
                py={1}
              >
                <Typography variant="body1" className="text-wrap">
                  Hey Prachi
                </Typography>
              </Box>

              <Box
                component="span"
                bgcolor="primary.main"
                flexWrap="wrap"
                borderRadius="1.5rem .25rem 1.5rem 1.5rem"
                px={1.5}
                py={1}
              >
                <Typography variant="body1">
                  Hey Prachi, , I just finishe
                </Typography>
              </Box>
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
