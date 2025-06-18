import { IconButton, InputAdornment, TextField } from "@mui/material";
import { Close, Search } from "@mui/icons-material";
import { FC, memo, useEffect, useState } from "react";
import { useDebounce } from "../../hooks/useDebounce";

type PropsType = {
  search: string;
  setSearch: (value: string) => void;
};

export const SearchInput: FC<PropsType> = memo(
  ({ search, setSearch }) => {
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
          variant="outlined"
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
                  {value ? <Close className="icon-fs-20" /> : <Search color="disabled" className="icon-fs-20" />}
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
