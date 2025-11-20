import { IconButton, InputAdornment, TextField } from "@mui/material";
import { Close, Search } from "@mui/icons-material";
import { FC, memo, useEffect, useState } from "react";
import { useDebounce } from "../../hooks/useDebounce";
import { useIntl } from "react-intl";

type PropsType = {
  search: string;
  setSearch: (value: string) => void;
  placeholder?: string;
};

export const SearchInput: FC<PropsType> = memo(
  ({ search, setSearch, placeholder = "PLACEHOLDER.SEARCH" }) => {
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
      <>
        <TextField
          variant="outlined"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={i({ id: placeholder })}
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    sx={{
                      border: "none",
                      p: 0,
                    }}
                    onClick={handleClearSearch}
                  >
                    {value ? <Close className="fs-20" /> : <Search color="disabled" className="fs-20" />}
                  </IconButton>
                </InputAdornment>
              ),
            }
          }}
        />
      </>
    );
  }
);
