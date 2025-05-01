import { Avatar, Box, Card, Divider, Stack, Typography } from "@mui/material"
import { toAbsoluteUrl } from "../../../../../_themes/helpers"
import { useIntl } from "react-intl"

export const CompanyLogo = () => {
    const { formatMessage } = useIntl();
    return (
        <Box component={Card} p={3}>
            <Stack>
                <Typography variant="h5">{formatMessage({
                    id: "COMPANY_DETAILS.TAB.COMPANY_DETAIL.CUSTOMIZATION",
                })}</Typography>
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
                    <Typography variant="body1">{formatMessage({
                        id: "COMPANY_DETAILS.TAB.COMPANY_DETAIL.INDUSTRY",
                    })}</Typography>
                    <Typography variant="body2">Software Development</Typography>
                </Stack>
            </Stack>
        </Box>
    )
}