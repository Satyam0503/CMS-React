import { Box, ButtonBase, Divider, Stack, Typography } from "@mui/material"
import { useState } from "react";
import { useIntl } from "react-intl"
import { CustomisedModal } from "./C_Modal";
import CustomisedButton from "./C_Button";

export const ViewLeaveReason = ({ reason }: { reason: string }) => {
    const { formatMessage: i } = useIntl();
    const [open, setOpen] = useState(false);
    return (
        <>
            <ButtonBase
                component="button"
                type="button"
                sx={{
                    color: 'secondary.main',
                    mx: 1,
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontSize: '0.75rem',
                    lineHeight: 1.2,
                    whiteSpace: 'nowrap',
                    '&:hover': { color: 'secondary.dark' }
                }}
                onClick={() => setOpen(true)}
            >
                {i({ id: "READ" })}...
            </ButtonBase>
            {open && (
                <CustomisedModal
                    open={true}
                    maxWidth="sm"
                    title={i({ id: "LEAVE.REASON" })}
                    handleClose={() => setOpen(false)}
                >
                    <Stack spacing={2} sx={{ minWidth: 0 }}>
                        <Typography variant="body2" color="text.secondary">
                            Review the leave application reason below.
                        </Typography>
                        <Divider />
                        <Box
                            role="region"
                            aria-label={i({ id: "LEAVE.REASON" })}
                            tabIndex={0}
                            sx={{
                                maxHeight: "min(52vh, 420px)",
                                overflowY: "auto",
                                overflowX: "hidden",
                                pr: 1.5,
                                py: 0.5,
                                whiteSpace: "pre-wrap",
                                overflowWrap: "anywhere",
                                scrollbarGutter: "stable",
                            }}
                        >
                            <Typography variant="body2" sx={{ lineHeight: 1.7 }}>
                                {reason?.trim() || i({ id: "LEAVE.NO_REASON_PROVIDED" })}
                            </Typography>
                        </Box>
                        <Divider />
                        <Stack direction="row" justifyContent="flex-end">
                            <CustomisedButton
                                label={i({ id: "BUTTON.CLOSE" })}
                                handleClick={() => setOpen(false)}
                            />
                        </Stack>
                    </Stack>
                </CustomisedModal>
            )}
        </>
    )
}
