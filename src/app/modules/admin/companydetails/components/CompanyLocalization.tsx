import { Stack, Box, Card, Typography, Divider, Grid } from "@mui/material";
import CustomisedButton from "../../../../shared/components/CustomisedButton";
import { useIntl } from "react-intl";
import { colors } from "../../../theme/MuiTheme";

export const CompanyLocalization = () => {
    const { formatMessage } = useIntl();
    return (
        <Box component={Card} sx={{ p: 3 }}>
            <Stack direction={"row"} sx={{ justifyContent: "space-between" }}>
                <Typography variant="h5">
                    {formatMessage({ id: "COMPANY_DETAILS.TAB.COMPANY_DETAIL.LOCALIZATION" })}
                </Typography>
                <CustomisedButton
                    label={formatMessage({ id: "COMPANY_DETAILS.EDIT_DETAILS" })}
                />
            </Stack>
            <Divider sx={{ my: 2 }} />
            <Stack spacing={2}>
                <Stack spacing={1}>
                    <Stack>
                        <Typography variant="h6">
                            {formatMessage({
                                id: "COMPANY_DETAILS.TAB.COMPANY_DETAIL.LANGUAGES",
                            })}
                        </Typography>
                    </Stack>
                    <Grid container spacing={1}>
                        <Grid item xs={12} md={4}>
                            <Typography variant="body1" color={colors.alpha.primary[500]}>
                                {formatMessage({
                                    id: "COMPANY_DETAILS.TAB.COMPANY_DETAIL.DEFAULT_COMPANY_LANGUAGE",
                                })}
                            </Typography>
                            <Typography variant="body2">English</Typography>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Typography variant="body1" color={colors.alpha.primary[500]}>
                                {formatMessage({
                                    id: "COMPANY_DETAILS.TAB.COMPANY_DETAIL.APPLICATION_LANGUAGE",
                                })}
                            </Typography>
                            <Typography variant="body2">English, French</Typography>
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
            </Stack>
        </Box>
    );
};
