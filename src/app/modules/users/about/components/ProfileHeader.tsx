import {
  CalendarMonth,
  CorporateFareOutlined,
  Build,
} from "@mui/icons-material";
import { Grid, useTheme } from "@mui/material";
import IconStat from "../../../../shared/components/IconStat";
import { useAppSelector } from "../../../../Redux/hooks";
import { useUserDetails } from "../../UserDataProvider";
import { getDateDiffInYears } from "../../../../../utils/common";
import { useIntl } from "react-intl";

export const ProfileHeader = () => {
  const companyName = useAppSelector(
    (state) => state.user.userData?.companyName
  );
  const { userDetails, totalSkills } = useUserDetails();
  const { formatMessage } = useIntl();
  const theme = useTheme();

  const years = Math.floor(userDetails.totalWorkExperience / 12);
  const months = userDetails.totalWorkExperience % 12;

  return (
    <Grid container spacing={2} direction="column">
      <Grid item xs={12} sm={4}>
        <IconStat
          iconBg={theme.palette.secondary.lighter}
          icon={<CalendarMonth fontSize="large" />}
          iconColor="secondary.dark"
          number={formatMessage({ id: (years || months) ? "PROFILE.PI.EXPERIENCE_TEXT" : "PLURAL.YEAR" }, { years, months })}
          title={formatMessage({ id: "PROFILE.PI.EOX" })}
        />
      </Grid>
      <Grid item xs={12} sm={4}>
        <IconStat
          iconBg={theme.palette.primary.lighter}
          icon={<CorporateFareOutlined fontSize="large" />}
          iconColor="primary.main"
          number={getDateDiffInYears(userDetails.dateOfJoining!)}
          title={formatMessage(
            { id: "PROFILE.PI.TOTAL_YEAR" },
            { companyName }
          )}
        />
      </Grid>
      <Grid item xs={12} sm={4}>
        <IconStat
          iconBg={theme.palette.secondary.lighter}
          icon={<Build fontSize="large" />}
          iconColor="secondary.dark"
          number={totalSkills}
          title={formatMessage({ id: "PROFILE.SKILLS.TOTAL_SKILLS" })}
        />
      </Grid>
    </Grid>
  );
};
