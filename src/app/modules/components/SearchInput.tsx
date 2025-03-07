import { IconButton, InputAdornment, TextField } from "@mui/material";
import { Close, Search } from "@mui/icons-material";
import { FC, memo, useEffect, useState } from "react";
import { useDebounce } from "../../hooks/useDebounce";
import { colors } from "../theme/MuiTheme";

type PropsType = {
  search: string;
  label: string;
  style?: React.CSSProperties;
  setSearch: (value: string) => void;
  variant?: "outlined" | "filled" | "standard";
};

export const SearchInput: FC<PropsType> = memo(
  ({ search, setSearch, style, variant }) => {
    const [value, setValue] = useState(search);
    const debouncedValue = useDebounce(value);

    useEffect(() => {
      setSearch(debouncedValue);
    }, [debouncedValue]);

    const handleClearSearch = () => {
      setValue("");
    };

    return (
      <>
        <TextField
          variant={variant}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  sx={{
                    border: "none",
                    p: 0,
                  }}
                  onClick={handleClearSearch}
                >
                  {value ? <Close /> : <Search color="disabled" />}
                </IconButton>
              </InputAdornment>
            ),
          }}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Search ..."
        />
      </>
    );
  }
);
