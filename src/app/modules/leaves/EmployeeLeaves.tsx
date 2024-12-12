import { Grid } from "@mui/material";
import { FC } from "react";
import HourglassBottomIcon from "@mui/icons-material/HourglassBottom";
import { useIntl } from "react-intl";
import IconStat from "../components/IconStat";
import { colors } from "../theme/MuiTheme";

const EmployeeLeaves: FC = () => {
  const intl = useIntl();
  return (
    <>
      <Grid container>
        <Grid item xs={12} sm={6} md={3}>
          <IconStat
            variant={colors.alpha.primary[100]}
            icon={<HourglassBottomIcon />}
            number={"3"}
            title="First Half"
          />
        </Grid>
      </Grid>
    </>
  );
};

export default EmployeeLeaves;
