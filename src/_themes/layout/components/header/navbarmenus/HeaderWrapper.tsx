import { IconButton, Stack, useMediaQuery, useTheme } from "@mui/material";
import { MenuOutlined } from "@mui/icons-material";
import { FC, useCallback, useEffect, useState } from "react";
import { Navbar } from "./Navbar";
import { SearchInput } from "../../../../../app/shared/components/SearchInput";

type Props = {
  openSideBar: () => void;
}

export const HeaderWrapper: FC<Props> = ({ openSideBar }) => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down(theme.breakpoints.values.md));
  const [search, setSearch] = useState<string>("");

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
  }, []);

  return (
    <Stack
      sx={{
        backgroundColor: 'background.header',
      }}
      className="p-4 flex-row align-items-center justify-content-between position-sticky top-0 z-3"
    >
      {
        isSmallScreen &&
        <IconButton sx={{ border: 0 }} onClick={openSideBar}>
          <MenuOutlined className="icon-fs-32" />
        </IconButton>
      }
      <Stack direction={"row"} className="align-items-center flex-grow-1 justify-content-end gap-5" >
        <SearchInput search={search} setSearch={handleSearchChange} />
        <Navbar />
      </Stack>
    </Stack>
  );
}

