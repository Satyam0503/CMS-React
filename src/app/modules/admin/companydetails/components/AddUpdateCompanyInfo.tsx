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

import { useIntl } from "react-intl";
import CustomisedButton from "../../../../shared/components/CustomisedButton";
import { colors } from "../../../theme/MuiTheme";
import { toAbsoluteUrl } from "../../../../../_themes/helpers";
import { SelectInput } from "../../../../shared/components/form-component/SelectInput";
import { TagFacesOutlined } from "@mui/icons-material";
import { Days } from "../../../../../utils/constant/Constant";
import CustomSelectChip from "../../../../shared/components/CustomSelectChip";

const ListItem = styled("li")(({ theme }) => ({
  margin: theme.spacing(0.5),
}));
export const AddUpdateCompanyInfo: FC = () => {
  const [selectedDay, setSelectedDay] = React.useState("today");

  const intl = useIntl();
  const [language, setLanguage] = React.useState("");

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
          <CustomisedButton variant="outlined" label="Cancel" />
          <CustomisedButton variant="contained" label="Update" />
        </Stack>
        <Box component={Card} p={3}>
          <Stack>
            <Typography variant="h5">Localization</Typography>
          </Stack>
          <Divider sx={{ my: 2 }} />

          <Stack spacing={2}>
            <Stack spacing={1}>
              <Stack>
                <Typography variant="h6">Languages</Typography>
              </Stack>
              <Grid container spacing={1}>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth>
                    <InputLabel id="demo-simple-select-label">
                      Select Language
                    </InputLabel>
                    <Select
                      labelId="demo-simple-select-label"
                      id="demo-simple-select"
                      value={language}
                      label="Language"
                      onChange={handleChange}
                    >
                      <MenuItem value={10}>English</MenuItem>
                      <MenuItem value={20}>German</MenuItem>
                      <MenuItem value={30}>French</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={4}>
                  {/* <Typography
                    variant="body1"
                    mb={1}
                    color={colors.alpha.primary[500]}
                  >
                    Application Language
                  </Typography> */}
                  <CustomSelectChip />
                </Grid>
                <Grid item xs={12} md={4}>
                  {/* <Typography variant="body1" color={colors.alpha.primary[500]}>
                    Survey Language
                  </Typography> */}
                  <CustomSelectChip />
                </Grid>
              </Grid>
            </Stack>

            <Stack spacing={1}>
              <Stack>
                <Typography variant="h6">Company Name</Typography>
                <Typography variant="body2">
                  The company name is displayed on the application side menu and
                  it is also displayed in all survey questions having a tag such
                  as [company].
                </Typography>
              </Stack>
              <Grid container spacing={1}>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    variant="standard"
                    type="text"
                    id="outlined-required"
                    label="English"
                    sx={{ color: colors.alpha.primary[500] }}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    variant="standard"
                    type="text"
                    id="outlined-required"
                    label="French"
                    sx={{ color: colors.alpha.primary[500] }}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth>
                    <InputLabel
                      variant="standard"
                      htmlFor="uncontrolled-native"
                    >
                      Select Language
                    </InputLabel>
                    <NativeSelect
                      defaultValue={10}
                      inputProps={{
                        name: "selectLanguage",
                        id: "uncontrolled-native",
                      }}
                    >
                      <option value={10}>French</option>
                      <option value={20}>German</option>
                      <option value={30}>Japanease</option>
                    </NativeSelect>
                  </FormControl>
                </Grid>
              </Grid>
            </Stack>

            <Stack spacing={1}>
              <Stack>
                <Typography variant="h6">Managers Identification</Typography>
                <Typography variant="body2">
                  The manager tag will be replaced according to your choosen
                  terminology, for some orgnization, it will be manager, but for
                  some others, it will be supervisor or director.
                </Typography>
              </Stack>
              <Grid container spacing={1}>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    variant="standard"
                    type="text"
                    id="outlined-required"
                    label="English"
                    sx={{ color: colors.alpha.primary[500] }}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    variant="standard"
                    type="text"
                    id="outlined-required"
                    label="French"
                    sx={{ color: colors.alpha.primary[500] }}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth>
                    <InputLabel
                      variant="standard"
                      htmlFor="uncontrolled-native"
                    >
                      Select Language
                    </InputLabel>
                    <NativeSelect
                      defaultValue={30}
                      inputProps={{
                        name: "selectLanguage",
                        id: "uncontrolled-native",
                      }}
                    >
                      <option value={10}>French</option>
                      <option value={20}>German</option>
                      <option value={30}>Japanease</option>
                    </NativeSelect>
                  </FormControl>
                </Grid>
              </Grid>
            </Stack>
          </Stack>
        </Box>
        <Box component={Card} p={3}>
          <Stack>
            <Typography variant="h5">Cutomization</Typography>
          </Stack>
          <Divider sx={{ my: 2 }} />
          <Stack spacing={1}>
            <Stack width={"200px"}>
              <Avatar
                alt=""
                src={toAbsoluteUrl("media/avatars/300-6.jpg")}
                sx={{
                  width: "100%",
                  height: "100%",
                }}
              />
            </Stack>

            <TextField
              variant="standard"
              type="text"
              id="outlined-required"
              label="Company Name"
              sx={{ color: colors.alpha.primary[500] }}
            />
            <Stack className="text-nowrap">
              <TextField
                fullWidth
                variant="standard"
                type="text"
                id="outlined-required"
                label="Industry"
                sx={{ color: colors.alpha.primary[500] }}
              />
            </Stack>
          </Stack>
        </Box>
        <Box component={Card} p={3}>
          <Stack>
            <Typography variant="h5">Employee management</Typography>
          </Stack>
          <Divider sx={{ my: 2 }} />
          <Stack width={"200px"} spacing={1}>
            <TextField
              fullWidth
              variant="outlined"
              type="text"
              id="outlined-required"
              label="Primary Contact"
              sx={{ color: colors.alpha.primary[500] }}
            />
            <Stack className="text-nowrap">
              <TextField
                fullWidth
                variant="outlined"
                type="text"
                id="outlined-required"
                label="Email id"
                sx={{ color: colors.alpha.primary[500] }}
              />
            </Stack>
          </Stack>
        </Box>
      </Stack>
    </>
  );
};
