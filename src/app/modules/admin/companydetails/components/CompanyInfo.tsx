import {
  Avatar,
  Box,
  Card,
  Divider,
  Grid,
  Stack,
  Switch,
  Typography,
} from "@mui/material";
import React, { FC } from "react";

import { useIntl } from "react-intl";
import CustomisedButton from "../../../../shared/components/CustomisedButton";
import { colors } from "../../../theme/MuiTheme";
import { toAbsoluteUrl } from "../../../../../_themes/helpers";

export const CompanyInfo: FC = () => {
  const intl = useIntl();

  return (
    <>
      <Stack spacing={2}>
        <Stack
          display="flex"
          justifyContent="flex-end"
          alignItems={"end"}
          pt={2}
        >
          <CustomisedButton label="Edit company details" />
        </Stack>
        <Box component={Card} p={3}>
          <Stack>
            <Typography variant="h5">Localization</Typography>
          </Stack>
          <Divider sx={{ my: 2 }} />

          <Stack spacing={2}>
            <Stack spacing={1}>
              <Stack>
                <Typography variant="h6">Languages</Typography>
              </Stack>
              <Grid container spacing={1}>
                <Grid item xs={12} md={4}>
                  <Typography variant="body1" color={colors.alpha.primary[500]}>
                    Default Company Language
                  </Typography>
                  <Typography variant="body2">English</Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="body1" color={colors.alpha.primary[500]}>
                    Application Language
                  </Typography>
                  <Typography variant="body2">English, French</Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="body1" color={colors.alpha.primary[500]}>
                    Survey Language
                  </Typography>
                  <Typography variant="body2">English, French</Typography>
                </Grid>
              </Grid>
            </Stack>

            <Stack spacing={1}>
              <Stack>
                <Typography variant="h6">Company Name</Typography>
                <Typography variant="body2">
                  The company name is displayed on the application side menu and
                  it is also displayed in all survey questions having a tag such
                  as [company].
                </Typography>
              </Stack>
              <Grid container spacing={1}>
                <Grid item xs={12} md={4}>
                  <Typography variant="body1" color={colors.alpha.primary[500]}>
                    English
                  </Typography>
                  <Typography variant="body2">Keywords pvt ltd</Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="body1" color={colors.alpha.primary[500]}>
                    French
                  </Typography>
                  <Typography variant="body2"></Typography>
                </Grid>
              </Grid>
            </Stack>

            <Stack spacing={1}>
              <Stack>
                <Typography variant="h6">Managers Identification</Typography>
                <Typography variant="body2">
                  The manager tag will be replaced according to your choosen
                  terminology, for some orgnization, it will be manager, but for
                  some others, it will be supervisor or director.
                </Typography>
              </Stack>
              <Grid container spacing={1}>
                <Grid item xs={12} md={4}>
                  <Typography variant="body1" color={colors.alpha.primary[500]}>
                    English
                  </Typography>
                  <Typography variant="body2">Manager</Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="body1" color={colors.alpha.primary[500]}>
                    French
                  </Typography>
                  <Typography variant="body2">gestionnaire</Typography>
                </Grid>
              </Grid>
            </Stack>
          </Stack>
        </Box>
        <Box component={Card} p={3}>
          <Stack>
            <Typography variant="h5">Cutomization</Typography>
          </Stack>
          <Divider sx={{ my: 2 }} />
          <Stack width={"150px"} spacing={1}>
            <Avatar
              alt=""
              src={toAbsoluteUrl("media/avatars/300-6.jpg")}
              sx={{
                width: "100%",
                height: "100%",
              }}
            />
            <Typography variant="body1">Keywords pvt ltd</Typography>
            <Stack className="text-nowrap">
              <Typography variant="body1">Industry</Typography>
              <Typography variant="body2">Software Development</Typography>
            </Stack>
          </Stack>
        </Box>
        <Box component={Card} p={3}>
          <Stack>
            <Typography variant="h5">Employee management</Typography>
          </Stack>
          <Divider sx={{ my: 2 }} />
          <Stack width={"150px"} spacing={1}>
            <Typography variant="body1">Primary contact</Typography>
            <Typography variant="body2">Sohan Singh</Typography>
            <Stack className="text-nowrap">
              <Typography variant="body1">Email</Typography>
              <Typography variant="body2">Keywords@gmail.com</Typography>
            </Stack>
          </Stack>
        </Box>
      </Stack>
    </>
  );
};
