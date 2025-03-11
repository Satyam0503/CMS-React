import { Grid, Menu, Stack, useMediaQuery, useTheme } from "@mui/material";
import {
  Edit,
  MenuOutlined,
  RecordVoiceOver,
  Search,
} from "@mui/icons-material";
import { useCallback, useState } from "react";
import { SearchInput } from "../../SearchInput";
import { colors } from "../../../../modules/theme/MuiTheme";
import { Navbar } from "./Navbar";

export function HeaderWrapper() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState<string>("");
  const theme = useTheme();
  const toggleDrawer = () => {
    setOpen(!open);
  };
  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
  }, []);

  return (
    <Grid
      item
      position={"sticky"}
      top={0}
      zIndex={3}
      bgcolor={"#fcfcfc"}
      py={1}
    >
      <Grid item display={"flex"} alignItems={"center"} px={1}>
        <Grid
          item
          display={{ xs: "block", md: "none" }}
          id="kt_app_sidebar_mobile_toggle"
        >
          <MenuOutlined fontSize="large" onClick={toggleDrawer} />
        </Grid>

        <Grid
          item
          display={"flex"}
          justifyContent={"flex-end"}
          flexGrow={1}
          alignItems={"center"}
          gap={2}
        >
          <Stack>
            <SearchInput
              variant="standard"
              search={search}
              setSearch={handleSearchChange}
            />
          </Stack>
          <Stack>
            <Navbar />
          </Stack>
        </Grid>
      </Grid>
    </Grid>
  );
}
