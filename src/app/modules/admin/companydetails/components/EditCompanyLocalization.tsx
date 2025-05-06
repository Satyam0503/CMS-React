import { Box, Card, Stack, Typography, Divider, Grid, FormControl, InputLabel, Select, MenuItem, TextField, NativeSelect } from "@mui/material"
import CustomSelectChip from "../../../../shared/components/CustomSelectChip"
import { useIntl } from "react-intl"
import { colors } from "../../../theme/MuiTheme"
import { languages } from "../../../../../utils/constant/Constant"

export const EditCompanyLocalization = () => {
    const intl = useIntl();
    return (
        <Stack spacing={2}>
            <Stack spacing={1}>
                <Stack>
                    <Typography variant="h6">{intl.formatMessage({
                        id: "COMPANY_DETAILS.TAB.COMPANY_DETAIL.LANGUAGES",
                    })}</Typography>
                </Stack>
                <Grid container spacing={1}>
                    <Grid item xs={12} md={6} lg={4}>
                        <FormControl fullWidth>
                            <InputLabel id="demo-simple-select-label">
                                Select Language
                            </InputLabel>
                            <Select
                                labelId="demo-simple-select-label"
                                id="demo-simple-select"
                                label="Language"
                            >
                                {languages.map((language) => {
                                    return (<MenuItem key={language.id} value={language.lang}>{language.name}</MenuItem>)
                                })}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} md={6} lg={4}>
                        {/* <Typography
                    variant="body1"
                    mb={1}
                    color={colors.alpha.primary[500]}
                  >
                    Application Language
                  </Typography> */}
                        <CustomSelectChip />
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
                        <TextField
                            fullWidth
                            variant="standard"
                            type="text"
                            id="outlined-required"
                            label="English"
                            sx={{ color: colors.alpha.primary[500] }}
                        />
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <TextField
                            fullWidth
                            variant="standard"
                            type="text"
                            id="outlined-required"
                            label="French"
                            sx={{ color: colors.alpha.primary[500] }}
                        />
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <FormControl fullWidth>
                            <InputLabel
                                variant="standard"
                                htmlFor="uncontrolled-native"
                            >
                                Select Language
                            </InputLabel>
                            <NativeSelect
                                defaultValue={10}
                                inputProps={{
                                    name: "selectLanguage",
                                    id: "uncontrolled-native",
                                }}
                            >
                                <option value={10}>French</option>
                                <option value={20}>German</option>
                                <option value={30}>Japanease</option>
                            </NativeSelect>
                        </FormControl>
                    </Grid>
                </Grid>
            </Stack>
        </Stack>
    )
}