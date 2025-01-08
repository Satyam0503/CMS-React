import {
  Button,
  Card,
  Grid,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  useTheme,
} from "@mui/material";
import CustomisedButton from "./CustomisedButton";
import {
  Add,
  Close,
  Download,
  FilterList,
  SearchOutlined,
} from "@mui/icons-material";

export const CustomisedSearch = () => {
  const theme = useTheme();
  return (
    <Grid item>
      <Stack
        direction="row"
        display={"flex"}
        justifyContent={"space-between"}
        alignItems={"center"}
      >
        <Stack>
          <TextField
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchOutlined />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton sx={{ border: "none" }}>
                    <Close />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            variant="outlined"
            placeholder="Search something ..."
          />
        </Stack>
      </Stack>
    </Grid>
  );
};
