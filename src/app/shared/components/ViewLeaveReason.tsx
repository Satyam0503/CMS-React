import { Box, Stack, Typography } from "@mui/material"
import { useState } from "react";
import { useIntl } from "react-intl"
import { CustomisedModal } from "./CustomisedModal";
import CustomisedButton from "./CustomisedButton";

export const ViewLeaveReason = ({ reason }: { reason: string }) => {
    const { formatMessage: i } = useIntl();
    const [open, setOpen] = useState(false);
    return (
        <>
            <Box component="span" role="button" sx={{
                color: 'secondary.main', mx: 1, "&:hover": {
                    color: 'secondary.dark'
                }
            }}
                onClick={() => setOpen(true)}
            >{i({ id: "READ" })}...</Box>
            {
                open &&
                <CustomisedModal open={true} maxWidth="xs" handleClose={() => setOpen(false)}>
                    <Stack spacing={2}>
                        <Typography variant="body1" className="text-break">{reason}</Typography>
                        <CustomisedButton className="align-self-end" label={i({ id: "BUTTON.CLOSE" })} handleClick={() => setOpen(false)} />
                    </Stack>
                </CustomisedModal>
            }
        </>
    )
}