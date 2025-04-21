import {
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

export const CompanyInfo: FC = () => {
  const intl = useIntl();

  return (
    <>
      <Stack display="flex" justifyContent="flex-end" alignItems={"end"} p={2}>
        <CustomisedButton label="Edit company details" />
      </Stack>
      <Box component={Card} p={3}>
        <Stack>
          <Typography variant="h4" mb={1}>
            {intl.formatMessage({
              id: "COMPANY_DETAILS.TAB.COMPANY_DETAIL.LOCALIZATION",
            })}
          </Typography>
        </Stack>
        <Divider sx={{ my: 2 }} />

        <Stack spacing={2}>
          <Stack spacing={1}>
            <Stack>
              <Typography variant="h6">{intl.formatMessage({
              id: "COMPANY_DETAILS.TAB.COMPANY_DETAIL.LANGUAGES",
            })}</Typography>
            </Stack>
            <Grid container spacing={1}>
              <Grid item xs={12} md={4}>
                <Typography variant="body1" color={colors.alpha.primary[500]}>
                {intl.formatMessage({
              id: "COMPANY_DETAILS.TAB.COMPANY_DETAIL.DEFAULT_COMPANY_LANGUAGE",
            })}
                </Typography>
                <Typography variant="body2">English</Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="body1" color={colors.alpha.primary[500]}>
                {intl.formatMessage({
              id: "COMPANY_DETAILS.TAB.COMPANY_DETAIL.APPLICATION_LANGUAGE",
            })}
                </Typography>
                <Typography variant="body2">English, French</Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="body1" color={colors.alpha.primary[500]}>
                {intl.formatMessage({
              id: "COMPANY_DETAILS.TAB.COMPANY_DETAIL.SURVEY_LANGUAGE",
            })}
                </Typography>
                <Typography variant="body2">English, French</Typography>
              </Grid>
            </Grid>
          </Stack>

          <Stack spacing={1}>
            <Stack>
              <Typography variant="h6">{intl.formatMessage({
              id: "COMPANY_DETAILS.TAB.COMPANY_DETAIL.COMPANY_NAME",
            })}</Typography>
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
              <Typography variant="h6">{intl.formatMessage({
              id: "COMPANY_DETAILS.TAB.COMPANY_DETAIL.MANAGERS_IDENTIFICATION",
            })}</Typography>
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
    </>
  );
};
