import { IconButton, InputAdornment, TextField } from "@mui/material";
import { Close } from "@mui/icons-material";
import { FC, memo, useEffect, useState } from "react";
import { useDebounce } from "../../hooks/useDebounce";

type PropsType = {
  search: string;
  setSearch: (value: string) => void;
};

export const SearchInput: FC<PropsType> = memo(({ search, setSearch }) => {
  const [value, setValue] = useState(search);
  const debouncedValue = useDebounce(value);

  useEffect(() => {
    setSearch(debouncedValue);
  }, [debouncedValue]);

  const handleClearSearch = () => {
    setValue("");
  };

  return (
    <TextField
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
              <IconButton sx={{ border: "none" }} onClick={handleClearSearch}>
                { search.length ? <Close />:"" }
              </IconButton>
          </InputAdornment>
        ),
      }}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      variant="outlined"
      placeholder="Search ..."
    />
  );
});
