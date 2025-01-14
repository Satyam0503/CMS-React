import {
  IconButton,
  InputAdornment,
  TextField,
} from "@mui/material";
import {
  Close,
  SearchOutlined,
} from "@mui/icons-material";
import { FC } from "react";


type PropsType ={
  search:string;
  setSearch:React.Dispatch<React.SetStateAction<string>>;
}

export const SearchInput:FC<PropsType> = (props) => {
  const {search,setSearch} = props;
  const handleClearSearch =()=>{
    setSearch("");
  }
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
            value={search}
            onChange={(e)=>setSearch(e.target.value)}
            variant="outlined"
            placeholder="Search Something ..."
          />
  );
};
