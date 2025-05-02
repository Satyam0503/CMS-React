import { Stack, Box, Card, Typography, Divider, Grid } from "@mui/material";
import CustomisedButton from "../../../../shared/components/CustomisedButton";
import { FormattedMessage, useIntl } from "react-intl";
import { colors } from "../../../theme/MuiTheme";
import { useState } from "react";
import { EditCompanyLocalization } from "./EditCompanyLocalization";
import { useCompanyInfoContext } from "./CompanyInfoProvider";
import { languages } from "../../../../../utils/constant/Constant";

export const CompanyLocalization = () => {
    const { formatMessage } = useIntl();
    const [isEdit, setEdit] = useState(false);
    const { companyInfo } = useCompanyInfoContext();
    console.log(companyInfo);

    const defaultLanguage = languages.find(lang => lang.lang === companyInfo.defaultLanguage)?.name ?? <FormattedMessage id={"NOT_AVAILABLE"} />;
    const applicationLanguage = languages.filter(lang => companyInfo.applicationLanguage?.includes(lang.lang));
    return (
        <Box component={Card} sx={{ p: 3 }}>
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
            {
                isEdit ? <EditCompanyLocalization /> :
                    <Stack spacing={2}>
                        <Stack spacing={1}>
                            <Stack>
                                <Typography variant="h6">
                                    {formatMessage({ id: "COMPANY_DETAILS.TAB.COMPANY_DETAIL.LANGUAGES" })}
                                </Typography>
                            </Stack>
                            <Grid container spacing={1}>
                                <Grid item xs={12} md={4}>
                                    <Typography variant="body1" color={colors.alpha.primary[500]}>
                                        {formatMessage({ id: "COMPANY_DETAILS.TAB.COMPANY_DETAIL.DEFAULT_COMPANY_LANGUAGE" })}
                                    </Typography>
                                    <Typography variant="body2"> {defaultLanguage} </Typography>
                                </Grid>
                                <Grid item xs={12} md={4}>
                                    <Typography variant="body1" color={colors.alpha.primary[500]}>
                                        {formatMessage({
                                            id: "COMPANY_DETAILS.TAB.COMPANY_DETAIL.APPLICATION_LANGUAGE",
                                        })}
                                    </Typography>
                                    <Typography variant="body2">{applicationLanguage.map(lang => lang.name)}</Typography>
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
                                    The company name is displayed on the application side menu and it
                                    is also displayed in all survey questions having a tag such as
                                    [company].
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
            }
        </Box>
    );
};
