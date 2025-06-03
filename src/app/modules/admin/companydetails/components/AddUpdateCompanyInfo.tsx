import {
  Avatar,
  Box,
  Card,
  Chip,
  Divider,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  NativeSelect,
  Select,
  SelectChangeEvent,
  Stack,
  styled,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import React, { FC } from "react";
import { languages } from "../../../../../utils/constant/Constant";
import { useIntl } from "react-intl";
import CustomisedButton from "../../../../shared/components/CustomisedButton";
import { toAbsoluteUrl } from "../../../../../_themes/helpers";
import { SelectInput } from "../../../../shared/components/form-component/SelectInput";
import { TagFacesOutlined } from "@mui/icons-material";
import { Days } from "../../../../../utils/constant/Constant";
import CustomSelectChip from "../../../../shared/components/CustomSelectChip";
import { useNavigate } from "react-router-dom";

const ListItem = styled("li")(({ theme }) => ({
  margin: theme.spacing(0.5),
}));
export const AddUpdateCompanyInfo: FC = () => {
  const [selectedDay, setSelectedDay] = React.useState("today");

  const intl = useIntl();
  const [language, setLanguage] = React.useState("");
  const navigate = useNavigate();

  const handleChange = (event: SelectChangeEvent) => {
    setLanguage(event.target.value as string);
  };

  return (
    <>
      <Stack spacing={2}>
        <Stack
          direction="row"
          display="flex"
          justifyContent="flex-end"
          alignItems={"end"}
          pt={2}
          spacing={1}
        >
          <CustomisedButton
            variant="outlined"
            label="Cancel"
            handleClick={() => navigate("../companyinfo")}
          />
          <CustomisedButton variant="contained" label="Update" />
        </Stack>

        <Box component={Card} p={3}>
          <Stack>
            <Typography variant="h5">
              {intl.formatMessage({
                id: "COMPANY_DETAILS.TAB.COMPANY_DETAIL.CUSTOMIZATION",
              })}
            </Typography>
          </Stack>
          <Divider sx={{ my: 2 }} />
          <Grid container flexDirection={"column"}>
            <Stack width={"150px"}>
              <Avatar
                alt=""
                src={toAbsoluteUrl("media/avatars/300-6.jpg")}
                sx={{
                  width: "100%",
                  height: "100%",
                }}
              />
            </Stack>
            <Grid item xs={12} md={6} my={1}>
              <TextField
                fullWidth
                variant="standard"
                type="text"
                id="outlined-required"
                label="Company Name"
                sx={{ color: "primary.main" }}
              />
            </Grid>
            <Grid item xs={12} md={6} className="text-nowrap">
              <TextField
                fullWidth
                variant="standard"
                type="text"
                id="outlined-required"
                label="Industry"
                sx={{ color: "primary.main" }}
              />
            </Grid>
          </Grid>
        </Box>
        <Box component={Card} p={3}>
          <Stack>
            <Typography variant="h5">
              {intl.formatMessage({
                id: "COMPANY_DETAILS.TAB.COMPANY_DETAIL.EMPLOYEE_MANAGEMENT",
              })}
            </Typography>
          </Stack>
          <Divider sx={{ my: 2 }} />
          <Grid container spacing={1} flexDirection={"column"}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                variant="outlined"
                type="text"
                id="outlined-required"
                label="Primary Contact"
                sx={{ color: "primary.main" }}
              />
            </Grid>

            <Grid item xs={12} md={6} className="text-nowrap mt-4">
              <FormControl fullWidth>
                <InputLabel id="demo-simple-select-label">
                  Default import attribute
                </InputLabel>
                <Select
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  value={language}
                  label="Default import attribute"
                  onChange={handleChange}
                >
                  <MenuItem value={10}>Email Id</MenuItem>
                  <MenuItem value={20}>Emp Id</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Box>
      </Stack>
    </>
  );
};
