import * as React from "react";
type ChatMessengerProps = {
  onChatSelect: (contact: { name: string }) => void;
};

import {
  Badge,
  Box,
  Divider,
  Link,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";

import { Close, Search } from "@mui/icons-material";
import { CustomIconButton } from "../../../../../app/shared/components/CustomIconButton";
import { toAbsoluteUrl } from "../../../../helpers";
import { SearchInput } from "../../../../../app/shared/components/SearchInput";
import { useNavigate } from "react-router-dom";

export default function ChatMessenger({ onChatSelect }: ChatMessengerProps) {
  const theme = useTheme();
  const navigate = useNavigate();
  const [search, setSearch] = React.useState<string>("");
  const handleSelectChat = (contactName: string) => {
    onChatSelect({ name: contactName });
  };

  const handleSearchChange = React.useCallback((value: string) => {
    setSearch(value);
  }, []);
  return (
    <Stack spacing={1}>
      <Stack
        direction={"row"}
        display={"flex"}
        justifyContent={"space-between"}
      >
        <Stack spacing={1}>
          <Typography variant="h5">Contacts</Typography>
        </Stack>

        <Stack direction={"row"}>
          <CustomIconButton icon={<Close />} />
        </Stack>
      </Stack>
      <Stack>
        <SearchInput search={search} setSearch={handleSearchChange} />
      </Stack>
      <Divider sx={{ py: 1 }} />
      <Stack spacing={1} mt={10} borderRadius={8} minHeight="80vh">
        <Box component="div">
          <Typography variant="h6">All Chats</Typography>
        </Box>
        <Link
          onClick={() => handleSelectChat("Deepa Narang")}
          sx={{ textDecoration: "none", cursor: "pointer" }}
        >
          <Stack
            direction="row"
            display={"flex"}
            justifyContent={"space-between"}
            alignItems={"start"}
            borderRadius={4}
            p={2}
            className="border"
            boxShadow={"0px 0px 4px #eeeeee;"}
          >
            <Stack direction="row" spacing={1}>
              <Badge
                badgeContent={2}
                color="primary"
                overlap="circular"
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "right",
                }}
              >
                <Stack sx={{ mr: 1, width: "45px", height: "45px" }}>
                  <img
                    src={toAbsoluteUrl("media/avatars/300-6.jpg")}
                    alt=""
                    style={{ borderRadius: "50%", height: "100%" }}
                  />
                </Stack>
              </Badge>
              <Stack>
                <Typography variant="body1">Deepa Narang</Typography>
                <Typography variant="subtitle1">
                  Hello Brain Cox, How r u ?
                </Typography>
              </Stack>
            </Stack>
            <Stack>
              <Typography variant="subtitle2">12:00 Am</Typography>
            </Stack>
          </Stack>
        </Link>

        <Link
          onClick={() => handleSelectChat("Deepak Chaurasiya")}
          sx={{ textDecoration: "none", cursor: "pointer" }}
        >
          <Stack
            direction="row"
            display={"flex"}
            justifyContent={"space-between"}
            alignItems={"start"}
            borderRadius={4}
            p={2}
            className="border"
            boxShadow={"0px 0px 4px #eeeeee;"}
          >
            <Stack direction="row" spacing={1}>
              <Badge
                badgeContent={2}
                color="primary"
                overlap="circular"
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "right",
                }}
              >
                <Stack sx={{ mr: 1, width: "45px", height: "45px" }}>
                  <img
                    src={toAbsoluteUrl("media/avatars/300-1.jpg")}
                    alt=""
                    style={{ borderRadius: "50%", height: "100%" }}
                  />
                </Stack>
              </Badge>
              <Stack>
                <Typography variant="body1">Deepak Chaurasiya</Typography>
                <Typography variant="subtitle1">
                  Hello Brain Cox, How r u ?
                </Typography>
              </Stack>
            </Stack>
            <Stack>
              <Typography variant="subtitle2">18:00 Pm</Typography>
            </Stack>
          </Stack>
        </Link>
        <Link
          onClick={() => handleSelectChat("Shweta Chamoli")}
          sx={{ textDecoration: "none", cursor: "pointer" }}
        >
          <Stack
            direction="row"
            display={"flex"}
            justifyContent={"space-between"}
            alignItems={"start"}
            borderRadius={4}
            p={2}
            className="border"
            boxShadow={"0px 0px 4px #eeeeee;"}
          >
            <Stack direction="row" spacing={1}>
              <Badge
                badgeContent={2}
                color="primary"
                overlap="circular"
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "right",
                }}
              >
                <Stack sx={{ mr: 1, width: "45px", height: "45px" }}>
                  <img
                    src={toAbsoluteUrl("media/avatars/300-6.jpg")}
                    alt=""
                    style={{ borderRadius: "50%", height: "100%" }}
                  />
                </Stack>
              </Badge>
              <Stack>
                <Typography variant="body1">Shweta Chamoli</Typography>
                <Typography variant="subtitle1">
                  Hello Brain Cox, How r u ?
                </Typography>
              </Stack>
            </Stack>
            <Stack>
              <Typography variant="subtitle2">12:00 Am</Typography>
            </Stack>
          </Stack>
        </Link>
      </Stack>
    </Stack>
  );
}
