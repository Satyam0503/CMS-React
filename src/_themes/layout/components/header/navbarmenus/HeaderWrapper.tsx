import { Grid, Menu, Stack, useMediaQuery, useTheme } from "@mui/material";
import {
  Edit,
  MenuOutlined,
  RecordVoiceOver,
  Search,
} from "@mui/icons-material";
import { useCallback, useState } from "react";

import { Navbar } from "./Navbar";
import { SearchInput } from "../../../../../app/shared/components/SearchInput";

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
      sx={{
        backgroundColor: 'background.header',
        py: 1,
        zIndex: 3,
        top: 0,
        position: "sticky"
      }}
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
          gap={{ xs: 0.5, md: 2 }}
        >
          <Stack pl={1}>
            <SearchInput search={search} setSearch={handleSearchChange} />
          </Stack>
          <Stack>
            <Navbar />
          </Stack>
        </Grid>
      </Grid>
    </Grid>
  );
}
