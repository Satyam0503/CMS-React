import { IconButton, InputAdornment, TextField } from "@mui/material";
import { Close, SearchOutlined } from "@mui/icons-material";
import { FC, useCallback, useEffect, useState } from "react";

type PropsType = {
  search: string;
  setSearch: React.Dispatch<React.SetStateAction<string>>;
};

export const SearchInput: FC<PropsType> = ({ search, setSearch }) => {
  const [debouncedValue, setDebouncedValue] = useState(search);

  const handleDebouncedSearch = useCallback(() => {  
    setSearch(debouncedValue);
  }, [debouncedValue, setSearch]);
  
  useEffect(() => {
    const timeoutId = setTimeout(handleDebouncedSearch, 1000);
    return () => clearTimeout(timeoutId);
  }, [debouncedValue, handleDebouncedSearch]);

  const handleClearSearch = () => {
    setSearch("");
  };

  return (
    <TextField
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            <IconButton sx={{ border: "none" }} onClick={handleClearSearch}>
              <Close />
            </IconButton>
          </InputAdornment>
        ),
      }}
      value={debouncedValue}
      onChange={(e) => setDebouncedValue(e.target.value)}
      variant="outlined"
      placeholder="Search ..."
    />
  );
};
