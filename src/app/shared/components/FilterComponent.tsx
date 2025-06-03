import { Close } from "@mui/icons-material"
import { IconButton, Popover, Stack, Typography } from "@mui/material"
import { FC } from "react"
import { useIntl } from "react-intl"

type Props = {
    open: boolean,
    anchorEl: null | Element,
    handleClose: () => void,
    id?: string,
    children: React.ReactNode
}

export const FilterComponent: FC<Props> = ({ open, anchorEl, handleClose, id, children }) => {
    const { formatMessage } = useIntl();
    return (
        <Popover
            id={id}
            open={open}
            anchorEl={anchorEl}
            elevation={10}
            onClose={handleClose}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
            slotProps={{
                paper: {
                    sx: {
                        maxWidth: 450,
                        width: 350,
                        p: 2.5
                    }
                }
            }}
        >
            <Stack spacing={2} >
                <Stack
                    direction={"row"}
                    sx={{ justifyContent: "space-between", alignItems: "center" }}
                >
                    <Typography variant="h6">
                        {formatMessage({ id: "FILTER" })}
                    </Typography>
                    <IconButton className="border-0" onClick={handleClose}>
                        <Close />
                    </IconButton>
                </Stack>
                {children}
            </Stack>
        </Popover>
    )
}