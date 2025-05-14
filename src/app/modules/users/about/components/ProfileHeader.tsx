import {
  CalendarMonth,
  CorporateFareOutlined,
  Build,
} from "@mui/icons-material";
import { Stack, Grid, Box, CardContent } from "@mui/material";
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
  return (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      justifyContent={"center"}
      borderRadius={1}
      sx={{ bgcolor: "background.card" }}
    >
      <Grid item xs={12} sm={4}>
        <Box component={CardContent}>
          <IconStat
            iconBg="secondary.lighter"
            icon={<CalendarMonth fontSize="large" />}
            iconColor="secondary.main"
            number={14}
            title={formatMessage({ id: "PROFILE.EXP" })}
          />
        </Box>
      </Grid>
      <Grid item xs={12} sm={4}>
        <Box component={CardContent}>
          <IconStat
            iconBg="primary.lighter"
            icon={<CorporateFareOutlined fontSize="large" />}
            iconColor="primary.main"
            number={getDateDiffInYears(userDetails.dateOfJoining!)}
            title={formatMessage(
              { id: "PROFILE.EXP_CURRENT" },
              { companyName }
            )}
          />
        </Box>
      </Grid>
      <Grid item xs={12} sm={4}>
        <Box component={CardContent}>
          <IconStat
            iconBg="primary.light"
            icon={<Build fontSize="large" />}
            iconColor="primary.light"
            number={totalSkills}
            title={formatMessage({ id: "PROFILE.SKILLS_HOLDER" })}
          />
        </Box>
      </Grid>
    </Stack>
  );
};
