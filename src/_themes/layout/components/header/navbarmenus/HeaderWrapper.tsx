import { Grid, IconButton, Menu, Stack, useMediaQuery, useTheme } from "@mui/material";
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
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down(theme.breakpoints.values.md));
  const [search, setSearch] = useState<string>("");

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
  }, []);

  return (
    <Grid
      item
      sx={{
        backgroundColor: 'background.header',
        p: 1
      }}
      className="header-wrapper"
    >
      {
        isSmallScreen &&
        <IconButton sx={{ border: 0 }}>
          <MenuOutlined fontSize="large" />
        </IconButton>
      }
      <Stack direction={"row"} sx={{ alignItems: "center", flexGrow: 1, justifyContent: "flex-end" }} spacing={2}>
        <SearchInput search={search} setSearch={handleSearchChange} />
        <Navbar />
      </Stack>
    </Grid>
  );
}
