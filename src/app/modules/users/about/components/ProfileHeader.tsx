import { CalendarMonth, CorporateFareOutlined, Build } from "@mui/icons-material"
import { Stack, Grid, Box, CardContent } from "@mui/material"
import IconStat from "../../../../shared/components/IconStat"
import { colors } from "../../../theme/MuiTheme"
import { useAppSelector } from "../../../../Redux/hooks"
import { useUserDetails } from "../../UserDataProvider"
import { getDateDiffInYears } from "../../../../../utils/common"
import { useIntl } from "react-intl"

export const ProfileHeader = ()=>{
const companyName = useAppSelector(state=>state.user.userData?.companyName);
const {userDetails,totalSkills} = useUserDetails();
const {formatMessage}= useIntl();
 return (
    <Stack
    direction={{ xs: "column", sm: "row" }}
    justifyContent={"center"}
    bgcolor={colors.alpha.white[500]}
    borderRadius={1}
  >
    <Grid item xs={12} sm={4}>
      <Box component={CardContent}>
        <IconStat
          iconBg={colors.alpha.secondary[100]}
          icon={<CalendarMonth fontSize="large" />}
          iconColor={colors.alpha.secondary[500]}
          number={14}
          title={formatMessage({id:"PROFILE.EXP"})}
        />
      </Box>
    </Grid>
    <Grid item xs={12} sm={4}>
      <Box component={CardContent}>
        <IconStat
          iconBg={colors.alpha.primary[100]}
          icon={<CorporateFareOutlined fontSize="large" />}
          iconColor={colors.alpha.primary[500]}
          number={getDateDiffInYears(userDetails.dateOfJoining!)}
          title={formatMessage({id:"PROFILE.EXP_CURRENT"},{companyName})}
        />
      </Box>
    </Grid>
    <Grid item xs={12} sm={4}>
      <Box component={CardContent}>
        <IconStat
          iconBg={colors.alpha.danger[100]}
          icon={<Build fontSize="large" />}
          iconColor={colors.alpha.danger[400]}
          number={totalSkills}
          title={formatMessage({id:"PROFILE.SKILLS_HOLDER"})}
        />
      </Box>
    </Grid>
  </Stack>
 )
}