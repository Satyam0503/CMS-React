import { FC, useEffect } from "react";

import { useIntl } from "react-intl";
import IconStat from "../../shared/components/IconStat";
import { Grid, Typography } from "@mui/material";
import { HourglassBottom } from "@mui/icons-material";
import { colors } from "../theme/MuiTheme";
import { usePageData } from "../../../_themes/layout/core";

export const EmployeeAttendance: FC = () => {
  const intl = useIntl();
  const {setPageTitle}= usePageData();

  useEffect(()=>{
    setPageTitle(intl.formatMessage({ id: "PAGE.ATTENDANCE" }))
  },[]);
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
