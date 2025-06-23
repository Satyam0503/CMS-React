import { FC, useState } from "react"
import { CustomisedModal } from "../../../shared/components/CustomisedModal"
import { Box, Stack, Typography } from "@mui/material";
import { useIntl } from "react-intl";
import CustomisedButton from "../../../shared/components/CustomisedButton";
type Props = {
    noticeMessage: string
}

export const NoticeViewModel: FC<Props> = ({ noticeMessage }) => {
    const [open, setOpen] = useState(false);
    const { formatMessage } = useIntl();
    return (
        <>
            <Box component="span" sx={{
                color: 'secondary.main', mx: 2, "&:hover": {
                    color: 'secondary.dark'
                }
            }}
                onClick={() => setOpen(true)}>{formatMessage({ id: "BUTTON.VIEW" })}...</Box>
            <CustomisedModal maxWidth="xs" open={open} handleClose={() => setOpen(false)}>
                <Box sx={{ mb: 3 }}>
                    <Typography variant="body1" sx={{ wordWrap: "break-word" }}>{noticeMessage}</Typography>
                </Box>
                <Stack sx={{ alignItems: "flex-end" }}>
                    <CustomisedButton
                        variant="outlined"
                        label={formatMessage({ id: "BUTTON.CLOSE" })}
                        handleClick={() => setOpen(false)}
                    />
                </Stack>
            </CustomisedModal>
        </>
    )
}