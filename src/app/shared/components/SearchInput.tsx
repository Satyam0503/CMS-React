import {
  Box,
  InputAdornment,
  SxProps,
  Theme,
} from "@mui/material";
import { Close, Search } from "@mui/icons-material";
import { FC, memo, useEffect, useState } from "react";
import { useDebounce } from "../../hooks/useDebounce";
import { useIntl } from "react-intl";

import { AppIconButton, AppTextField } from "./ui";
type PropsType = {
  search: string;
  setSearch: (value: string) => void;
  placeholder?: string;
  sx?: SxProps<Theme>;
};

export const SearchInput: FC<PropsType> = memo(
  ({ search, setSearch, placeholder = "PLACEHOLDER.SEARCH", sx }) => {
    const [value, setValue] = useState(search);
    const debouncedValue = useDebounce(value);
    const { formatMessage: i } = useIntl();

    useEffect(() => {
      if (debouncedValue.length >= 0) {
        setSearch(debouncedValue);
      }
    }, [debouncedValue]);

    const handleClearSearch = () => {
      setValue("");
    };

    return (
      <Box
        sx={[
          {
            width: { xs: "100%", sm: "clamp(240px, 32vw, 420px)" },
            flexShrink: 0,
          },
          ...(Array.isArray(sx) ? sx : [sx]),
        ]}
      >
        <AppTextField
          variant="outlined"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={i({ id: placeholder })}
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <AppIconButton
                    sx={{
                      border: "none",
                      p: 0,
                    }}
                    onClick={handleClearSearch}
                  >
                    {value ? <Close className="fs-20" /> : <Search color="disabled" className="fs-20" />}
                  </AppIconButton>
                </InputAdornment>
              ),
            }
          }}
        />
      </Box>
    );
  }
);
