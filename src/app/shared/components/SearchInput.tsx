import {
  Box,
  InputAdornment,
  SxProps,
  Theme,
} from "@mui/material";
import Close from "@mui/icons-material/Close";
import Search from "@mui/icons-material/Search";
import { FC, memo, useContext, useEffect, useState } from "react";
import { useDebounce } from "../../hooks/useDebounce";
import { IntlContext } from "react-intl";

import { AppIconButton, AppTextField } from "./ui";
type PropsType = {
  search: string;
  setSearch: (value: string) => void;
  placeholder?: string;
  sx?: SxProps<Theme>;
  fullWidth?: boolean;
};

export const SearchInput: FC<PropsType> = memo(
  ({ search, setSearch, placeholder = "PLACEHOLDER.SEARCH", sx, fullWidth = false }) => {
    const [value, setValue] = useState(search);
    const debouncedValue = useDebounce(value);
    const intl = useContext(IntlContext);
    const resolvedPlaceholder = intl
      ? intl.formatMessage({ id: placeholder, defaultMessage: placeholder })
      : placeholder;

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
            width: fullWidth ? "100%" : { xs: "100%", sm: "clamp(200px, 22vw, 300px)" },
            maxWidth: fullWidth ? "none" : "100%",
            minWidth: 0,
            flexShrink: 1,
            flexGrow: fullWidth ? 1 : undefined,
          },
          ...(Array.isArray(sx) ? sx : [sx]),
        ]}
      >
        <AppTextField
          fullWidth
          variant="outlined"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={resolvedPlaceholder}
          sx={{
            width: "100%",
            "& .MuiOutlinedInput-root": {
              width: "100%",
              height: 40,
              borderRadius: "10px",
              bgcolor: "color-mix(in srgb, var(--mui-palette-background-paper) 80%, transparent)",
              backdropFilter: "blur(12px) saturate(160%)",
              WebkitBackdropFilter: "blur(12px) saturate(160%)",
              transition: "background-color 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease",
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: "var(--mui-palette-divider, rgba(203, 213, 225, 0.75))",
                borderWidth: "1px",
              },
              "&:hover": {
                bgcolor: "color-mix(in srgb, var(--mui-palette-background-paper) 95%, transparent)",
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "primary.main",
                },
              },
              "&.Mui-focused": {
                bgcolor: "background.paper",
                boxShadow: "none",
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "primary.main",
                  borderWidth: "1.5px",
                },
              },
            },
          }}
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <AppIconButton
                    sx={{
                      border: "none",
                      p: 0.5,
                      color: "text.secondary",
                      "&:hover": { color: "primary.main", bgcolor: "transparent" },
                    }}
                    onClick={handleClearSearch}
                  >
                    {value ? <Close sx={{ fontSize: 18 }} /> : <Search sx={{ fontSize: 19, color: "text.secondary" }} />}
                  </AppIconButton>
                </InputAdornment>
              ),
            },
          }}
        />
      </Box>
    );
  },
);
