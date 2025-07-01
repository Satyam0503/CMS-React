import { FC, useState } from "react"
import { CustomisedModal } from "../../../shared/components/CustomisedModal"
import { Avatar, Box, Stack, Typography } from "@mui/material";
import { useIntl } from "react-intl";
import CustomisedButton from "../../../shared/components/CustomisedButton";
import { relativeTimeFormatter, sanitizeHtmlContent } from "../../../../utils/common";
type Props = {
    noticeMessage: string,
    postedBy: string,
    profileImage: string,
    postedDateTime: string,
    jobRole?: string
    open?: boolean,
    handleClose?: () => void
}

export const NoticeViewModel: FC<Props> = (props) => {
    const [open, setOpen] = useState(false);
    const { formatMessage } = useIntl();
    return (
        <>
            {
                !props.open &&
                <Box component="span" sx={{
                    color: 'secondary.main', mx: 2, "&:hover": {
                        color: 'secondary.dark'
                    }
                }}
                    onClick={() => setOpen(true)}>{formatMessage({ id: "BUTTON.VIEW" })}...</Box>
            }
            <CustomisedModal maxWidth="xs" open={props.open ?? open} handleClose={() => setOpen(false)}>
                <Stack className="flex-row gap-2">
                    <Avatar
                        src={props.profileImage}
                        alt="User Profile"
                    />
                    <Stack >
                        <Typography variant="body1">{props.postedBy}</Typography>
                        <Typography variant="caption">{relativeTimeFormatter(props.postedDateTime)}</Typography>
                    </Stack>
                </Stack>
                <Box
                    component="div"
                    className="my-4"
                    dangerouslySetInnerHTML={{
                        __html: sanitizeHtmlContent(props.noticeMessage),
                    }}
                />
                <Stack sx={{ alignItems: "flex-end" }}>
                    <CustomisedButton
                        variant="outlined"
                        label={formatMessage({ id: "BUTTON.CLOSE" })}
                        handleClick={props.open ? () => props.handleClose?.() : () => setOpen(false)}
                    />
                </Stack>
            </CustomisedModal>
        </>
    )
}