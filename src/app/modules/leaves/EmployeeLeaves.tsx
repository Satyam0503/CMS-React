import {
  Card,
  CardContent,
  Container,
  FormControl,
  Grid,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  Input,
  InputBase,
} from "@mui/material";
import { FC } from "react";
import { useIntl } from "react-intl";
import IconStat from "../components/IconStat";
import { colors } from "../theme/MuiTheme";
import {
  CalendarToday,
  Home,
  HourglassBottom,
  HourglassTop,
  WorkOff,
} from "@mui/icons-material";

export const EmployeeLeaves: FC = () => {
  const intl = useIntl();
  return (
    <Container>
      <Grid container spacing={4} mt={0}>
        <Grid item xs={12}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <IconStat
                    iconBg={colors.alpha.secondary[100]}
                    icon={<HourglassBottom fontSize="large" />}
                    iconColor={colors.alpha.secondary[500]}
                    number={"3"}
                    title="First Half"
                  />
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <IconStat
                    iconBg={colors.alpha.primary[100]}
                    icon={<HourglassTop fontSize="large" />}
                    iconColor={colors.alpha.primary[500]}
                    number={"1"}
                    title="Second Half"
                  />
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <IconStat
                    iconBg={colors.alpha.info[100]}
                    icon={<Home fontSize="large" />}
                    iconColor={colors.alpha.info[600]}
                    number={"1"}
                    title="Work from Home"
                  />
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <IconStat
                    iconBg={colors.alpha.danger[100]}
                    icon={<WorkOff fontSize="large" />}
                    iconColor={colors.alpha.danger[400]}
                    number={"7"}
                    title="Absent"
                  />
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>

        <Grid container item xs={12}>
          <Grid xs={6}>
            <FormControl sx={{ m: 1, minWidth: 120 }}>
              <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                label="Today"
                defaultValue={20}
                renderValue={(value) => {
                  if (value === 20) return "This Week";
                  if (value === 21) return "This Month";
                  if (value === 22) return "This Year";
                  return "";
                }}
              >
                <MenuItem value={20}>This Week</MenuItem>
                <MenuItem value={21}>This Month</MenuItem>
                <MenuItem value={22}>This Year</MenuItem>
              </Select>

              {/* Use a custom InputBase component to add the icon */}
              <InputBase
                startAdornment={
                  <InputAdornment position="start">
                    <CalendarToday />
                  </InputAdornment>
                }
                sx={{ width: "100%", mt: 2 }} // Adjust styling as needed
              />
            </FormControl>
          </Grid>
          <Grid xs={6}></Grid>
        </Grid>
      </Grid>
    </Container>
  );
};
