import {
  CalendarMonth,
  CorporateFareOutlined,
  Build,
} from "@mui/icons-material";
import { Grid, useTheme } from "@mui/material";
import IconStat from "../../../../shared/components/IconStat";
import { useAppSelector } from "../../../../Redux/hooks";
import { useUserDetails } from "../../UserDataProvider";
import { useIntl } from "react-intl";
import { getYearsAtCurrentCompany } from "./profileHeaderUtils";

export const ProfileHeader = () => {
  const companyName = useAppSelector((state) => state.user.userData?.companyName);
  const { userDetails, totalSkills } = useUserDetails();
  const { formatMessage: i } = useIntl();
  const theme = useTheme();
  const experience = userDetails.totalWorkExperience ? (userDetails.totalWorkExperience / 12).toFixed(1) : 0;
  const totalYearAtCurrentCompany = getYearsAtCurrentCompany(userDetails.dateOfJoining);

  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
        <IconStat
          iconBg={theme.vars?.palette.secondary.lighter}
          icon={<CalendarMonth fontSize="large" />}
          iconColor="secondary.dark"
          number={experience}
          title={i({ id: "PROFILE.PI.YOE" }, { years: experience })}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
        <IconStat
          iconBg={theme.vars?.palette.primary.lighter}
          icon={<CorporateFareOutlined fontSize="large" />}
          iconColor="primary.main"
          number={totalYearAtCurrentCompany}
          title={i({ id: "PROFILE.PI.TOTAL_YEAR" }, { years: totalYearAtCurrentCompany, companyName })}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
        <IconStat
          iconBg={theme.vars?.palette.secondary.lighter}
          icon={<Build fontSize="large" />}
          iconColor="secondary.dark"
          number={totalSkills}
          title={i({ id: "PROFILE.SKILLS.TOTAL_SKILLS" })}
        />
      </Grid>
    </Grid>
  );
};
