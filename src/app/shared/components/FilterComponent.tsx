import { Close } from "@mui/icons-material"
import { Popover, Stack, Typography } from "@mui/material"
import { AppIconButton } from "./ui"
import { FC } from "react"
import { useIntl } from "react-intl"
import { FilterComponentProps } from "../../../utils/common_types"


export const FilterComponent: FC<FilterComponentProps> = ({ open, anchorEl, handleClose, id, children }) => {
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
                },
            }}
        >
            <Stack spacing={1} >
                <Stack
                    direction={"row"}
                    sx={{ justifyContent: "space-between", alignItems: "center" }}
                >
                    <Typography variant="h6">
                        {formatMessage({ id: "FILTER" })}
                    </Typography>
                    <AppIconButton className="border-0" onClick={handleClose}>
                        <Close className="fs-20" />
                    </AppIconButton>
                </Stack>
                {children}
            </Stack>
        </Popover>
    )
}