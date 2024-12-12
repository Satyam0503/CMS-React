import { Card, CardContent, Grid } from "@mui/material";
import { FC } from "react";
import HourglassBottomIcon from "@mui/icons-material/HourglassBottom";
import { useIntl } from "react-intl";
import IconStat from "../components/IconStat";
import { colors } from "../theme/MuiTheme";

export const EmployeeLeaves: FC = () => {
  const intl = useIntl();
  return (
    <Grid container spacing={4}>
      <Grid item xs={12}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <IconStat
                  iconBg={colors.alpha.primary[100]}
                  icon={<HourglassBottomIcon fontSize="large" />}
                  iconColor={colors.alpha.primary[500]}
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
                  icon={<HourglassBottomIcon fontSize="large" />}
                  iconColor={colors.alpha.primary[500]}
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
                  icon={<HourglassBottomIcon fontSize="large" />}
                  iconColor={colors.alpha.primary[500]}
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
                  icon={<HourglassBottomIcon fontSize="large" />}
                  iconColor={colors.alpha.primary[500]}
                  number={"3"}
                  title="First Half"
                />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};
