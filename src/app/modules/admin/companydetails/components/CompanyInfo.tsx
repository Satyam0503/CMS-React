import {
  Avatar,
  Box,
  Divider,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import { FC, useEffect, useState } from "react";

import { FormattedMessage, useIntl } from "react-intl";
import CustomisedButton from "../../../../shared/components/CustomisedButton";
import { CompanyInfoModel } from "../../models";
import { getCompanyDetails } from "../../adminservices";
import { colors } from "../../../theme/MuiTheme";
import { languages } from "../../../../../utils/constant/Constant";

export const CompanyInfo: FC = () => {
  const { formatMessage } = useIntl();
  const [isEdit, setEdit] = useState(false);
  const [companyInfo, setCompanyInfo] = useState<CompanyInfoModel>({} as CompanyInfoModel);

  const defaultLanguage = languages.find(lang => lang.lang === companyInfo?.defaultLanguage)?.name ?? <FormattedMessage id={"NOT_AVAILABLE"} />
  const applicationLanguages = companyInfo?.applicationLanguage?.length > 0 ? languages.filter(lang => companyInfo?.applicationLanguage.includes(lang.lang)).map(lang => lang.name) : <FormattedMessage id={"NOT_AVAILABLE"} />;
  useEffect(() => {
    (async () => {
      const response = await getCompanyDetails();
      if (response.data.success) {
        setCompanyInfo(response.data.methodResult);
      }
    })();
  }, [])
  return (
    <Stack spacing={1}>
      <Box component="div" sx={{ p: 3, bgcolor: colors.alpha.white[500] }}>
        <Stack direction={"row"} sx={{ justifyContent: "space-between" }}>
          <Typography variant="h5">
            {formatMessage({ id: "COMPANY_DETAILS.TAB.COMPANY_DETAIL.LOCALIZATION" })}
          </Typography>
          {
            isEdit ?
              <Stack direction="row" spacing={1}>
                <CustomisedButton variant="outlined" label={formatMessage({ id: "BUTTON.CANCEL" })} handleClick={() => setEdit(false)} />
                <CustomisedButton label={formatMessage({ id: "BUTTON.UPDATE" })} />
              </Stack>
              :
              <CustomisedButton
                label={formatMessage({ id: "COMPANY_DETAILS.EDIT_DETAILS" })}
                handleClick={() => setEdit(true)}
              />
          }
        </Stack>
        <Divider sx={{ my: 2 }} />
        <Stack spacing={2}>
          <Stack spacing={1}>
            <Stack>
              <Typography variant="h6">
                {formatMessage({ id: "COMPANY_DETAILS.TAB.COMPANY_DETAIL.LANGUAGES" })}
              </Typography>
            </Stack>
            <Grid container spacing={1}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body1" color={colors.alpha.primary[500]}>
                  {formatMessage({ id: "COMPANY_DETAILS.TAB.COMPANY_DETAIL.DEFAULT_COMPANY_LANGUAGE" })}
                </Typography>
                <Typography variant="body2">{defaultLanguage}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body1" color={colors.alpha.primary[500]}>
                  {formatMessage({
                    id: "COMPANY_DETAILS.TAB.COMPANY_DETAIL.APPLICATION_LANGUAGE",
                  })}
                </Typography>
                <Typography variant="body2">{applicationLanguages}</Typography>
              </Grid>
            </Grid>
          </Stack>
          <Divider sx={{ my: 2 }} />
          <Stack spacing={1}>
            <Stack>
              <Typography variant="h6">
                {formatMessage({ id: "COMPANY_DETAILS.TAB.COMPANY_DETAIL.COMPANY_NAME", })}
              </Typography>
              <Typography variant="body2">
                The company name is displayed on the application side menu.
              </Typography>
            </Stack>
            <Grid container spacing={1}>
              <Grid item xs={12} md={4}>
                <Typography variant="body1" color={colors.alpha.primary[500]}>
                  {formatMessage({ id: "Language.English" })}
                </Typography>
                <Typography variant="body2">{companyInfo.companyName}</Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="body1" color={colors.alpha.primary[500]}>
                  French
                </Typography>
                <Typography variant="body2"></Typography>
              </Grid>
            </Grid>
          </Stack>
        </Stack>
      </Box >
      <Box component="div" sx={{ p: 3, bgcolor: colors.alpha.white[500] }}>
        <Typography variant="h6">{formatMessage({ id: "COMPANY_DETAILS.TAB.COMPANY_DETAIL.LOGO" })}</Typography>
        <Stack spacing={1} sx={{ marginBlockStart: 2 }}>
          <Avatar
            variant="square"
            alt={formatMessage({ id: "COMPANY_DETAILS.TAB.COMPANY_DETAIL.LOGO" })}
            src={companyInfo.companyLogo}
            sx={{
              width: "200px",
              height: "50px",
              marginBlockStart: 2,
              objectFit: "contain",
              objectPosition: "center",
              backgroundColor: "black"
            }}
          />
          <Typography variant="body1">{companyInfo.companyName}</Typography>
          <Stack className="text-nowrap">
            <Typography variant="body1">{formatMessage({
              id: "COMPANY_DETAILS.TAB.COMPANY_DETAIL.INDUSTRY",
            })}</Typography>
            <Typography variant="body2">Software Development</Typography>
          </Stack>
        </Stack>
      </Box>
    </Stack >
  );
};
