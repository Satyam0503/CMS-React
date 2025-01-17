import { FC } from "react";

import { useIntl } from "react-intl";
import { StyledCard } from "../components/StyledCard";
import IconStat from "../components/IconStat";
import { Grid } from "@mui/material";
import { HourglassBottom } from "@mui/icons-material";
import { colors } from "../theme/MuiTheme";

export const EmployeeAttendance: FC = () => {
  const intl = useIntl();
  return (
    <Grid container>
      {/* <StyledCard>
        <IconStat
          iconBg={colors.alpha.secondary[100]}
          icon={<HourglassBottom fontSize="large" />}
          iconColor={colors.alpha.secondary[500]}
          number={"3"}
          title="First Half"
        />
      </StyledCard> */}
      <StyledCard
        icon={
          <IconStat
            iconBg={colors.alpha.secondary[100]}
            icon={<HourglassBottom fontSize="large" />}
            iconColor={colors.alpha.secondary[500]}
            number={"3"}
            title="First Half"
          />
        }
      />
    </Grid>
  );
};
