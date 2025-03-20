import { FC } from "react";

import { useIntl } from "react-intl";
import IconStat from "../../shared/components/IconStat";
import { Grid, Typography } from "@mui/material";
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
      <Typography variant="h4" mb={3}>
        {intl.formatMessage({ id: "MENU.ATTENDANCE" })}
      </Typography>
      <IconStat
        iconBg={colors.alpha.secondary[100]}
        icon={<HourglassBottom fontSize="large" />}
        iconColor={colors.alpha.secondary[500]}
        number={"3"}
        title="First Half"
      />
    </Grid>
  );
};
