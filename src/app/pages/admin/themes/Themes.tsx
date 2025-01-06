import {
  Typography,
  Card,
  Grid,
  Stack,
  Button,
  TextField,
  InputAdornment,
  InputLabel,
  IconButton,
  FormControl,
  Select,
  MenuItem,
} from "@mui/material";
import { useIntl } from "react-intl";
import { Check, Colorize, Undo, Edit } from "@mui/icons-material";
import CustomisedButton from "../../../modules/components/CustomisedButton";

type Props = {
  className: string;
};

export default function Themes() {
  const intl = useIntl();
  return (
    <>
      <Grid
        container
        display={"flex"}
        flexDirection={"column"}
        sx={{ maxWidth: "1200px", mx: "auto", my: 2 }}
        spacing={2}
      >
        <Stack>
          <Typography variant="h4" my={2}>
            {intl.formatMessage({ id: "THEME.SETTING" })}
          </Typography>
        </Stack>
        <Card sx={{ p: 5 }}>
          <Grid container display={"flex"} justifyContent={"flex-end"} gap={2}>
            <CustomisedButton
              variant="outlined"
              label="Reset"
              Icon={<Undo />}
              iconPosition="start"
            />
            <CustomisedButton
              variant="contained"
              label="Save Changes"
              Icon={<Check />}
              iconPosition="start"
            />
          </Grid>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="body1" mt={3}>
                {intl.formatMessage({ id: "HEADING.LOGO" })}
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <InputLabel shrink htmlFor="bootstrap-input">
                Light Mode
              </InputLabel>
              <TextField
                fullWidth
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton>
                        <Edit />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <InputLabel shrink htmlFor="bootstrap-input">
                Dark Mode
              </InputLabel>
              <Stack>
                <TextField
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton>
                          <Edit />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Stack>
            </Grid>
            <Grid item xs={12} md={6}>
              <InputLabel shrink htmlFor="bootstrap-input">
                Company Name
              </InputLabel>
              <TextField fullWidth />
            </Grid>
          </Grid>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="h5" mt={3}>
                {intl.formatMessage({ id: "THEME.COLOR" })}
              </Typography>
              <Typography variant="h6" mt={1}>
                {intl.formatMessage({ id: "THEME.COLOR_LIGHT" })}
              </Typography>
            </Grid>

            <Grid item xs={12} md={3}>
              <InputLabel shrink htmlFor="bootstrap-input">
                {intl.formatMessage({ id: "COLOR.PRIMARY" })}
              </InputLabel>
              <TextField
                fullWidth
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <Colorize />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <InputLabel shrink htmlFor="bootstrap-input">
                {intl.formatMessage({ id: "COLOR.SECONDARY" })}
              </InputLabel>
              <Stack>
                <TextField
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <Colorize />
                      </InputAdornment>
                    ),
                  }}
                />
              </Stack>
            </Grid>
            <Grid item xs={12} md={3}>
              <InputLabel shrink htmlFor="bootstrap-input">
                {intl.formatMessage({ id: "COLOR.TERRITORY" })}
              </InputLabel>
              <TextField
                fullWidth
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <Colorize />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <InputLabel shrink htmlFor="bootstrap-input">
                {intl.formatMessage({ id: "COLOR.INFO" })}
              </InputLabel>
              <Stack>
                <TextField
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <Colorize />
                      </InputAdornment>
                    ),
                  }}
                />
              </Stack>
            </Grid>
            <Grid item xs={12} md={3}>
              <InputLabel shrink htmlFor="bootstrap-input">
                {intl.formatMessage({ id: "COLOR.NEUTRAL" })}
              </InputLabel>
              <TextField
                fullWidth
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <Colorize />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <InputLabel shrink htmlFor="bootstrap-input">
                {intl.formatMessage({ id: "COLOR.SUCCESS" })}
              </InputLabel>
              <Stack>
                <TextField
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <Colorize />
                      </InputAdornment>
                    ),
                  }}
                />
              </Stack>
            </Grid>
            <Grid item xs={12} md={3}>
              <InputLabel shrink htmlFor="bootstrap-input">
                {intl.formatMessage({ id: "COLOR.WARNING" })}
              </InputLabel>
              <TextField
                fullWidth
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <Colorize />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <InputLabel shrink htmlFor="bootstrap-input">
                {intl.formatMessage({ id: "COLOR.DANGER" })}
              </InputLabel>
              <Stack>
                <TextField
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <Colorize />
                      </InputAdornment>
                    ),
                  }}
                />
              </Stack>
            </Grid>
            <Grid item xs={12} md={3}>
              <InputLabel shrink htmlFor="bootstrap-input">
                {intl.formatMessage({ id: "COLOR.HEADING" })}
              </InputLabel>
              <FormControl fullWidth>
                <Select
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                >
                  <MenuItem>
                    {intl.formatMessage({ id: "COLOR.NEUTRAL" })} 100
                  </MenuItem>
                  <MenuItem>
                    {intl.formatMessage({ id: "COLOR.NEUTRAL" })} 200
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <InputLabel shrink htmlFor="bootstrap-input">
                {intl.formatMessage({ id: "COLOR.SECONDARY_HEADING" })}
              </InputLabel>
              <Stack>
                <FormControl fullWidth>
                  <Select
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                  >
                    <MenuItem>
                      {intl.formatMessage({ id: "COLOR.NEUTRAL" })} 100
                    </MenuItem>
                    <MenuItem>
                      {intl.formatMessage({ id: "COLOR.NEUTRAL" })} 200
                    </MenuItem>
                  </Select>
                </FormControl>
              </Stack>
            </Grid>
            <Grid item xs={12} md={3}>
              <InputLabel shrink htmlFor="bootstrap-input">
                {intl.formatMessage({ id: "COLOR.BODY" })}
              </InputLabel>
              <FormControl fullWidth>
                <Select
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                >
                  <MenuItem>
                    {intl.formatMessage({ id: "COLOR.NEUTRAL" })} 100
                  </MenuItem>
                  <MenuItem>
                    {intl.formatMessage({ id: "COLOR.NEUTRAL" })} 200
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <InputLabel shrink htmlFor="bootstrap-input">
                {intl.formatMessage({ id: "COLOR.LINK" })}
              </InputLabel>
              <Stack>
                <FormControl fullWidth>
                  <Select
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                  >
                    <MenuItem>
                      {intl.formatMessage({ id: "COLOR.NEUTRAL" })} 100
                    </MenuItem>
                    <MenuItem>
                      {intl.formatMessage({ id: "COLOR.NEUTRAL" })} 200
                    </MenuItem>
                  </Select>
                </FormControl>
              </Stack>
            </Grid>
            <Grid item xs={12} md={3}>
              <InputLabel shrink htmlFor="bootstrap-input">
                {intl.formatMessage({ id: "COLOR.SIDEBAR" })}
              </InputLabel>
              <FormControl fullWidth>
                <Select
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                >
                  <MenuItem>
                    {intl.formatMessage({ id: "COLOR.NEUTRAL" })} 100
                  </MenuItem>
                  <MenuItem>
                    {intl.formatMessage({ id: "COLOR.NEUTRAL" })} 200
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <InputLabel shrink htmlFor="bootstrap-input">
                {intl.formatMessage({ id: "COLOR.SIDEBAR_TEXT" })}
              </InputLabel>
              <Stack>
                <FormControl fullWidth>
                  <Select
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                  >
                    <MenuItem>
                      {intl.formatMessage({ id: "COLOR.NEUTRAL" })} 100
                    </MenuItem>
                    <MenuItem>
                      {intl.formatMessage({ id: "COLOR.NEUTRAL" })} 200
                    </MenuItem>
                  </Select>
                </FormControl>
              </Stack>
            </Grid>
            <Grid item xs={12} md={3}>
              <InputLabel shrink htmlFor="bootstrap-input">
                {intl.formatMessage({ id: "COLOR.SIDEBAR_LINK" })}
              </InputLabel>
              <FormControl fullWidth>
                <Select
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                >
                  <MenuItem>
                    {intl.formatMessage({ id: "COLOR.NEUTRAL" })} 100
                  </MenuItem>
                  <MenuItem>
                    {intl.formatMessage({ id: "COLOR.NEUTRAL" })} 200
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <InputLabel shrink htmlFor="bootstrap-input">
                {intl.formatMessage({ id: "COLOR.BODY_BG" })}
              </InputLabel>
              <Stack>
                <FormControl fullWidth>
                  <Select
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                  >
                    <MenuItem>
                      {intl.formatMessage({ id: "COLOR.NEUTRAL" })} 100
                    </MenuItem>
                    <MenuItem>
                      {intl.formatMessage({ id: "COLOR.NEUTRAL" })} 200
                    </MenuItem>
                  </Select>
                </FormControl>
              </Stack>
            </Grid>
          </Grid>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="h6" mt={3}>
                {intl.formatMessage({ id: "THEME.COLOR_DARK " })}
              </Typography>
            </Grid>

            <Grid item xs={12} md={3}>
              <InputLabel shrink htmlFor="bootstrap-input">
                {intl.formatMessage({ id: "COLOR.PRIMARY" })}
              </InputLabel>
              <TextField
                fullWidth
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <Colorize />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <InputLabel shrink htmlFor="bootstrap-input">
                {intl.formatMessage({ id: "COLOR.SECONDARY" })}
              </InputLabel>
              <Stack>
                <TextField
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <Colorize />
                      </InputAdornment>
                    ),
                  }}
                />
              </Stack>
            </Grid>
            <Grid item xs={12} md={3}>
              <InputLabel shrink htmlFor="bootstrap-input">
                {intl.formatMessage({ id: "COLOR.TERRITORY" })}
              </InputLabel>
              <TextField
                fullWidth
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <Colorize />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <InputLabel shrink htmlFor="bootstrap-input">
                {intl.formatMessage({ id: "COLOR.INFO" })}
              </InputLabel>
              <Stack>
                <TextField
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <Colorize />
                      </InputAdornment>
                    ),
                  }}
                />
              </Stack>
            </Grid>
            <Grid item xs={12} md={3}>
              <InputLabel shrink htmlFor="bootstrap-input">
                {intl.formatMessage({ id: "COLOR.NEUTRAL" })}
              </InputLabel>
              <TextField
                fullWidth
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <Colorize />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <InputLabel shrink htmlFor="bootstrap-input">
                {intl.formatMessage({ id: "COLOR.SUCCESS" })}
              </InputLabel>
              <Stack>
                <TextField
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <Colorize />
                      </InputAdornment>
                    ),
                  }}
                />
              </Stack>
            </Grid>
            <Grid item xs={12} md={3}>
              <InputLabel shrink htmlFor="bootstrap-input">
                {intl.formatMessage({ id: "COLOR.WARNING" })}
              </InputLabel>
              <TextField
                fullWidth
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <Colorize />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <InputLabel shrink htmlFor="bootstrap-input">
                {intl.formatMessage({ id: "COLOR.DANGER" })}
              </InputLabel>
              <Stack>
                <TextField
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <Colorize />
                      </InputAdornment>
                    ),
                  }}
                />
              </Stack>
            </Grid>
            <Grid item xs={12} md={3}>
              <InputLabel shrink htmlFor="bootstrap-input">
                {intl.formatMessage({ id: "COLOR.HEADING" })}
              </InputLabel>
              <FormControl fullWidth>
                <Select
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                >
                  <MenuItem>
                    {intl.formatMessage({ id: "COLOR.NEUTRAL" })} 100
                  </MenuItem>
                  <MenuItem>
                    {intl.formatMessage({ id: "COLOR.NEUTRAL" })} 200
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <InputLabel shrink htmlFor="bootstrap-input">
                {intl.formatMessage({ id: "COLOR.SECONDARY_HEADING" })}
              </InputLabel>
              <Stack>
                <FormControl fullWidth>
                  <Select
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                  >
                    <MenuItem>
                      {intl.formatMessage({ id: "COLOR.NEUTRAL" })} 100
                    </MenuItem>
                    <MenuItem>
                      {intl.formatMessage({ id: "COLOR.NEUTRAL" })} 200
                    </MenuItem>
                  </Select>
                </FormControl>
              </Stack>
            </Grid>
            <Grid item xs={12} md={3}>
              <InputLabel shrink htmlFor="bootstrap-input">
                {intl.formatMessage({ id: "COLOR.BODY" })}
              </InputLabel>
              <FormControl fullWidth>
                <Select
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                >
                  <MenuItem>
                    {intl.formatMessage({ id: "COLOR.NEUTRAL" })} 100
                  </MenuItem>
                  <MenuItem>
                    {intl.formatMessage({ id: "COLOR.NEUTRAL" })} 200
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <InputLabel shrink htmlFor="bootstrap-input">
                {intl.formatMessage({ id: "COLOR.LINK" })}
              </InputLabel>
              <Stack>
                <FormControl fullWidth>
                  <Select
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                  >
                    <MenuItem>
                      {intl.formatMessage({ id: "COLOR.NEUTRAL" })} 100
                    </MenuItem>
                    <MenuItem>
                      {intl.formatMessage({ id: "COLOR.NEUTRAL" })} 200
                    </MenuItem>
                  </Select>
                </FormControl>
              </Stack>
            </Grid>
            <Grid item xs={12} md={3}>
              <InputLabel shrink htmlFor="bootstrap-input">
                {intl.formatMessage({ id: "COLOR.SIDEBAR" })}
              </InputLabel>
              <FormControl fullWidth>
                <Select
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                >
                  <MenuItem>
                    {intl.formatMessage({ id: "COLOR.NEUTRAL" })} 100
                  </MenuItem>
                  <MenuItem>
                    {intl.formatMessage({ id: "COLOR.NEUTRAL" })} 200
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <InputLabel shrink htmlFor="bootstrap-input">
                {intl.formatMessage({ id: "COLOR.SIDEBAR_TEXT" })}
              </InputLabel>
              <Stack>
                <FormControl fullWidth>
                  <Select
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                  >
                    <MenuItem>
                      {intl.formatMessage({ id: "COLOR.NEUTRAL" })} 100
                    </MenuItem>
                    <MenuItem>
                      {intl.formatMessage({ id: "COLOR.NEUTRAL" })} 200
                    </MenuItem>
                  </Select>
                </FormControl>
              </Stack>
            </Grid>
            <Grid item xs={12} md={3}>
              <InputLabel shrink htmlFor="bootstrap-input">
                {intl.formatMessage({ id: "COLOR.SIDEBAR_LINK" })}
              </InputLabel>
              <FormControl fullWidth>
                <Select
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                >
                  <MenuItem>
                    {intl.formatMessage({ id: "COLOR.NEUTRAL" })} 100
                  </MenuItem>
                  <MenuItem>
                    {intl.formatMessage({ id: "COLOR.NEUTRAL" })} 200
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <InputLabel shrink htmlFor="bootstrap-input">
                {intl.formatMessage({ id: "COLOR.BODY_BG" })}
              </InputLabel>
              <Stack>
                <FormControl fullWidth>
                  <Select
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                  >
                    <MenuItem>
                      {intl.formatMessage({ id: "COLOR.NEUTRAL" })} 100
                    </MenuItem>
                    <MenuItem>
                      {intl.formatMessage({ id: "COLOR.NEUTRAL" })} 200
                    </MenuItem>
                  </Select>
                </FormControl>
              </Stack>
            </Grid>
          </Grid>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="h5" mt={3}>
                {intl.formatMessage({ id: "Font" })}
              </Typography>
              <Typography variant="h6" mt={1}>
                {intl.formatMessage({ id: "Size (px)" })}
              </Typography>
            </Grid>

            <Grid item xs={12} md={3}>
              <InputLabel shrink htmlFor="bootstrap-input">
                {intl.formatMessage({ id: "H1" })}
              </InputLabel>
              <FormControl fullWidth>
                <Select
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                >
                  <MenuItem>
                    {intl.formatMessage({ id: "COLOR.NEUTRAL" })} 100
                  </MenuItem>
                  <MenuItem>
                    {intl.formatMessage({ id: "COLOR.NEUTRAL" })} 200
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <InputLabel shrink htmlFor="bootstrap-input">
                {intl.formatMessage({ id: "H2" })}
              </InputLabel>
              <Stack>
                <FormControl fullWidth>
                  <Select
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                  >
                    <MenuItem>
                      {intl.formatMessage({ id: "COLOR.NEUTRAL" })} 100
                    </MenuItem>
                    <MenuItem>
                      {intl.formatMessage({ id: "COLOR.NEUTRAL" })} 200
                    </MenuItem>
                  </Select>
                </FormControl>
              </Stack>
            </Grid>
            <Grid item xs={12} md={3}>
              <InputLabel shrink htmlFor="bootstrap-input">
                {intl.formatMessage({ id: "H3" })}
              </InputLabel>
              <FormControl fullWidth>
                <Select
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                >
                  <MenuItem>
                    {intl.formatMessage({ id: "COLOR.NEUTRAL" })} 100
                  </MenuItem>
                  <MenuItem>
                    {intl.formatMessage({ id: "COLOR.NEUTRAL" })} 200
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <InputLabel shrink htmlFor="bootstrap-input">
                {intl.formatMessage({ id: "H4" })}
              </InputLabel>
              <Stack>
                <FormControl fullWidth>
                  <Select
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                  >
                    <MenuItem>
                      {intl.formatMessage({ id: "COLOR.NEUTRAL" })} 100
                    </MenuItem>
                    <MenuItem>
                      {intl.formatMessage({ id: "COLOR.NEUTRAL" })} 200
                    </MenuItem>
                  </Select>
                </FormControl>
              </Stack>
            </Grid>
            <Grid item xs={12} md={3}>
              <InputLabel shrink htmlFor="bootstrap-input">
                {intl.formatMessage({ id: "H5" })}
              </InputLabel>
              <FormControl fullWidth>
                <Select
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                >
                  <MenuItem>
                    {intl.formatMessage({ id: "COLOR.NEUTRAL" })} 100
                  </MenuItem>
                  <MenuItem>
                    {intl.formatMessage({ id: "COLOR.NEUTRAL" })} 200
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <InputLabel shrink htmlFor="bootstrap-input">
                {intl.formatMessage({ id: "H6" })}
              </InputLabel>
              <Stack>
                <FormControl fullWidth>
                  <Select
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                  >
                    <MenuItem>
                      {intl.formatMessage({ id: "COLOR.NEUTRAL" })} 100
                    </MenuItem>
                    <MenuItem>
                      {intl.formatMessage({ id: "COLOR.NEUTRAL" })} 200
                    </MenuItem>
                  </Select>
                </FormControl>
              </Stack>
            </Grid>
            <Grid item xs={12} md={3}>
              <InputLabel shrink htmlFor="bootstrap-input">
                {intl.formatMessage({ id: "Body" })}
              </InputLabel>
              <FormControl fullWidth>
                <Select
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                >
                  <MenuItem>
                    {intl.formatMessage({ id: "COLOR.NEUTRAL" })} 100
                  </MenuItem>
                  <MenuItem>
                    {intl.formatMessage({ id: "COLOR.NEUTRAL" })} 200
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="h6" mt={2}>
                {intl.formatMessage({ id: "Weight" })}
              </Typography>
            </Grid>

            <Grid item xs={12} md={3}>
              <InputLabel shrink htmlFor="bootstrap-input">
                {intl.formatMessage({ id: "H1" })}
              </InputLabel>
              <FormControl fullWidth>
                <Select
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                >
                  <MenuItem>
                    {intl.formatMessage({ id: "COLOR.NEUTRAL" })} 100
                  </MenuItem>
                  <MenuItem>
                    {intl.formatMessage({ id: "COLOR.NEUTRAL" })} 200
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <InputLabel shrink htmlFor="bootstrap-input">
                {intl.formatMessage({ id: "H2" })}
              </InputLabel>
              <Stack>
                <FormControl fullWidth>
                  <Select
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                  >
                    <MenuItem>
                      {intl.formatMessage({ id: "COLOR.NEUTRAL" })} 100
                    </MenuItem>
                    <MenuItem>
                      {intl.formatMessage({ id: "COLOR.NEUTRAL" })} 200
                    </MenuItem>
                  </Select>
                </FormControl>
              </Stack>
            </Grid>
            <Grid item xs={12} md={3}>
              <InputLabel shrink htmlFor="bootstrap-input">
                {intl.formatMessage({ id: "H3" })}
              </InputLabel>
              <FormControl fullWidth>
                <Select
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                >
                  <MenuItem>
                    {intl.formatMessage({ id: "COLOR.NEUTRAL" })} 100
                  </MenuItem>
                  <MenuItem>
                    {intl.formatMessage({ id: "COLOR.NEUTRAL" })} 200
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <InputLabel shrink htmlFor="bootstrap-input">
                {intl.formatMessage({ id: "H4" })}
              </InputLabel>
              <Stack>
                <FormControl fullWidth>
                  <Select
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                  >
                    <MenuItem>
                      {intl.formatMessage({ id: "COLOR.NEUTRAL" })} 100
                    </MenuItem>
                    <MenuItem>
                      {intl.formatMessage({ id: "COLOR.NEUTRAL" })} 200
                    </MenuItem>
                  </Select>
                </FormControl>
              </Stack>
            </Grid>
            <Grid item xs={12} md={3}>
              <InputLabel shrink htmlFor="bootstrap-input">
                {intl.formatMessage({ id: "H5" })}
              </InputLabel>
              <FormControl fullWidth>
                <Select
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                >
                  <MenuItem>
                    {intl.formatMessage({ id: "COLOR.NEUTRAL" })} 100
                  </MenuItem>
                  <MenuItem>
                    {intl.formatMessage({ id: "COLOR.NEUTRAL" })} 200
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <InputLabel shrink htmlFor="bootstrap-input">
                {intl.formatMessage({ id: "H6" })}
              </InputLabel>
              <Stack>
                <FormControl fullWidth>
                  <Select
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                  >
                    <MenuItem>
                      {intl.formatMessage({ id: "COLOR.NEUTRAL" })} 100
                    </MenuItem>
                    <MenuItem>
                      {intl.formatMessage({ id: "COLOR.NEUTRAL" })} 200
                    </MenuItem>
                  </Select>
                </FormControl>
              </Stack>
            </Grid>
            <Grid item xs={12} md={3}>
              <InputLabel shrink htmlFor="bootstrap-input">
                {intl.formatMessage({ id: "Body" })}
              </InputLabel>
              <FormControl fullWidth>
                <Select
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                >
                  <MenuItem>
                    {intl.formatMessage({ id: "COLOR.NEUTRAL" })} 100
                  </MenuItem>
                  <MenuItem>
                    {intl.formatMessage({ id: "COLOR.NEUTRAL" })} 200
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
          <Grid container>
            <Grid item xs={12}>
              <Typography variant="h6" my={2}>
                {intl.formatMessage({ id: "Family" })}
              </Typography>
              <FormControl fullWidth>
                <Select
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                >
                  <MenuItem>
                    {intl.formatMessage({ id: "COLOR.NEUTRAL" })} 100
                  </MenuItem>
                  <MenuItem>
                    {intl.formatMessage({ id: "COLOR.NEUTRAL" })} 200
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
          <Grid
            container
            display={"flex"}
            justifyContent={"flex-end"}
            gap={2}
            mt={2}
          >
            <CustomisedButton
              variant="outlined"
              label="Reset"
              Icon={<Undo />}
              iconPosition="start"
            />
            <CustomisedButton
              variant="contained"
              label="Save Changes"
              Icon={<Check />}
              iconPosition="start"
            />
          </Grid>
        </Card>
      </Grid>
    </>
  );
}
