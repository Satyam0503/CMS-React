import {
  Typography,
  Card,
  Grid,
  Stack,
  Button,
  TextField,
  InputAdornment,
  IconButton,
  FormControl,
  Select,
  MenuItem,
  Container,
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
      <Container>
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
              <Typography>Light Mode</Typography>
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
              <Typography>Dark Mode</Typography>
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
              <Typography>Company Name</Typography>
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
              <Typography variant="body2">
                {intl.formatMessage({ id: "COLOR.PRIMARY" })}
              </Typography>
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
              <Typography variant="body2">
                {intl.formatMessage({ id: "COLOR.SECONDARY" })}
              </Typography>
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
              <Typography variant="body2">
                {intl.formatMessage({ id: "COLOR.TERRITORY" })}
              </Typography>
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
              <Typography variant="body2">
                {intl.formatMessage({ id: "COLOR.INFO" })}
              </Typography>
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
              <Typography variant="body2">
                {intl.formatMessage({ id: "COLOR.NEUTRAL" })}
              </Typography>
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
              <Typography variant="body2">
                {intl.formatMessage({ id: "COLOR.SUCCESS" })}
              </Typography>
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
              <Typography variant="body2">
                {intl.formatMessage({ id: "COLOR.WARNING" })}
              </Typography>
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
              <Typography variant="body2">
                {intl.formatMessage({ id: "COLOR.DANGER" })}
              </Typography>
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
              <Typography variant="body2">
                {intl.formatMessage({ id: "COLOR.HEADING" })}
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
            <Grid item xs={12} md={3}>
              <Typography variant="body2">
                {intl.formatMessage({ id: "COLOR.SECONDARY_HEADING" })}
              </Typography>
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
              <Typography variant="body2">
                {intl.formatMessage({ id: "COLOR.BODY" })}
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
            <Grid item xs={12} md={3}>
              <Typography variant="body2">
                {intl.formatMessage({ id: "COLOR.LINK" })}
              </Typography>
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
              <Typography variant="body2">
                {intl.formatMessage({ id: "COLOR.SIDEBAR" })}
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
            <Grid item xs={12} md={3}>
              <Typography variant="body2">
                {intl.formatMessage({ id: "COLOR.SIDEBAR_TEXT" })}
              </Typography>
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
              <Typography variant="body2">
                {intl.formatMessage({ id: "COLOR.SIDEBAR_LINK" })}
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
            <Grid item xs={12} md={3}>
              <Typography variant="body2">
                {intl.formatMessage({ id: "COLOR.BODY_BG" })}
              </Typography>
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
              <Typography variant="body2">
                {intl.formatMessage({ id: "COLOR.PRIMARY" })}
              </Typography>
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
              <Typography variant="body2">
                {intl.formatMessage({ id: "COLOR.SECONDARY" })}
              </Typography>
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
              <Typography variant="body2">
                {intl.formatMessage({ id: "COLOR.TERRITORY" })}
              </Typography>
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
              <Typography variant="body2">
                {intl.formatMessage({ id: "COLOR.INFO" })}
              </Typography>
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
              <Typography variant="body2">
                {intl.formatMessage({ id: "COLOR.NEUTRAL" })}
              </Typography>
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
              <Typography variant="body2">
                {intl.formatMessage({ id: "COLOR.SUCCESS" })}
              </Typography>
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
              <Typography variant="body2">
                {intl.formatMessage({ id: "COLOR.WARNING" })}
              </Typography>
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
              <Typography variant="body2">
                {intl.formatMessage({ id: "COLOR.DANGER" })}
              </Typography>
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
              <Typography variant="body2">
                {intl.formatMessage({ id: "COLOR.HEADING" })}
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
            <Grid item xs={12} md={3}>
              <Typography variant="body2">
                {intl.formatMessage({ id: "COLOR.SECONDARY_HEADING" })}
              </Typography>
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
              <Typography variant="body2">
                {intl.formatMessage({ id: "COLOR.BODY" })}
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
            <Grid item xs={12} md={3}>
              <Typography variant="body2">
                {intl.formatMessage({ id: "COLOR.LINK" })}
              </Typography>
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
              <Typography variant="body2">
                {intl.formatMessage({ id: "COLOR.SIDEBAR" })}
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
            <Grid item xs={12} md={3}>
              <Typography variant="body2">
                {intl.formatMessage({ id: "COLOR.SIDEBAR_TEXT" })}
              </Typography>
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
              <Typography variant="body2">
                {intl.formatMessage({ id: "COLOR.SIDEBAR_LINK" })}
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
            <Grid item xs={12} md={3}>
              <Typography variant="body2">
                {intl.formatMessage({ id: "COLOR.BODY_BG" })}
              </Typography>
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
              <Typography variant="body2">
                {intl.formatMessage({ id: "H1" })}
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
            <Grid item xs={12} md={3}>
              <Typography variant="body2">
                {intl.formatMessage({ id: "H2" })}
              </Typography>
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
              <Typography variant="body2">
                {intl.formatMessage({ id: "H3" })}
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
            <Grid item xs={12} md={3}>
              <Typography variant="body2">
                {intl.formatMessage({ id: "H4" })}
              </Typography>
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
              <Typography variant="body2">
                {intl.formatMessage({ id: "H5" })}
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
            <Grid item xs={12} md={3}>
              <Typography variant="body2">
                {intl.formatMessage({ id: "H6" })}
              </Typography>
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
              <Typography variant="body2">
                {intl.formatMessage({ id: "Body" })}
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
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="h6" mt={2}>
                {intl.formatMessage({ id: "Weight" })}
              </Typography>
            </Grid>

            <Grid item xs={12} md={3}>
              <Typography variant="body2">
                {intl.formatMessage({ id: "H1" })}
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
            <Grid item xs={12} md={3}>
              <Typography variant="body2">
                {intl.formatMessage({ id: "H2" })}
              </Typography>
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
              <Typography variant="body2">
                {intl.formatMessage({ id: "H3" })}
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
            <Grid item xs={12} md={3}>
              <Typography variant="body2">
                {intl.formatMessage({ id: "H4" })}
              </Typography>
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
              <Typography variant="body2">
                {intl.formatMessage({ id: "H5" })}
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
            <Grid item xs={12} md={3}>
              <Typography variant="body2">
                {intl.formatMessage({ id: "H6" })}
              </Typography>
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
              <Typography variant="body2">
                {intl.formatMessage({ id: "Body" })}
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
      </Container>
    </>
  );
}
