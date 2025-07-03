import { Box, Typography } from "@mui/material"
import { useState } from "react";
import { useIntl } from "react-intl"
import { CustomisedModal } from "./CustomisedModal";
import CustomisedButton from "./CustomisedButton";

export const ViewLeaveReason = ({ reason }: { reason: string }) => {
    const { formatMessage: i } = useIntl();
    const [open, setOpen] = useState(false);
    return (
        <>
            <Box component="button" className="text-secondary pe-auto" onClick={() => setOpen(true)}>{i({ id: "READ" })}</Box>
            {
                open &&
                <CustomisedModal open={true} maxWidth="xs" handleClose={() => setOpen(false)}>
                    <Typography variant="body1" className="text-break">{reason}</Typography>
                    <CustomisedButton className="mt-4" label={i({ id: "BUTTON.CLOSE" })} handleClick={() => setOpen(true)} />
                </CustomisedModal>
            }
        </>
    )
}