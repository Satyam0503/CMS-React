import { FC } from "react"
import { CustomisedModal } from "../../../shared/components/CustomisedModal"
import { LeaveType } from "../model"
import { IconButton, Stack, Typography } from "@mui/material"
import { useIntl } from "react-intl"
import { Close } from "@mui/icons-material"

type Props = {
    isEdit: boolean,
    open: boolean,
    handleClose: () => void,
    initialLeaveTypeValue: LeaveType
}

export const AddLeaveTypes: FC<Props> = ({ isEdit, open, handleClose, initialLeaveTypeValue }) => {
    const { formatMessage: i } = useIntl();
    return (
        <CustomisedModal open={open} handleClose={handleClose}>
            <Stack spacing={2}>
                <Stack className="flex-row justify-content-between">
                    <Typography variant="h5">{i({ id: isEdit ? "EDIT_LEAVE_TYPE" : "ADD_LEAVE_TYPE" })}</Typography>
                    <IconButton onClick={handleClose}>
                        <Close />
                    </IconButton>
                </Stack>

            </Stack>
        </CustomisedModal>
    )
}