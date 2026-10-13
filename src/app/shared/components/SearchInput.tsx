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
};

export const SearchInput: FC<PropsType> = memo(
  ({ search, setSearch, placeholder = "PLACEHOLDER.SEARCH", sx }) => {
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
            width: { xs: "100%", sm: "clamp(200px, 22vw, 300px)" },
            maxWidth: "100%",
            minWidth: 0,
            flexShrink: 1,
          },
          ...(Array.isArray(sx) ? sx : [sx]),
        ]}
      >
        <AppTextField
          variant="outlined"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={resolvedPlaceholder}
          sx={{
            "& .MuiOutlinedInput-root": {
              height: 40,
              borderRadius: "10px",
              bgcolor: "rgba(255, 255, 255, 0.65)",
              backdropFilter: "blur(12px) saturate(160%)",
              WebkitBackdropFilter: "blur(12px) saturate(160%)",
              transition: "background-color 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease",
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: "rgba(203, 213, 225, 0.75)",
                borderWidth: "1px",
              },
              "&:hover": {
                bgcolor: "rgba(255, 255, 255, 0.85)",
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "rgba(11, 92, 171, 0.45)",
                },
              },
              "&.Mui-focused": {
                bgcolor: "#FFFFFF",
                boxShadow: "0 0 0 3px rgba(11, 92, 171, 0.14)",
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
                      color: "#64748B",
                      "&:hover": { color: "primary.main", bgcolor: "transparent" },
                    }}
                    onClick={handleClearSearch}
                  >
                    {value ? <Close sx={{ fontSize: 18 }} /> : <Search sx={{ fontSize: 19, color: "#64748B" }} />}
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
