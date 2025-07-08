import { Card, Stack, Tooltip, Typography } from "@mui/material"
import { useIntl } from "react-intl"
import { CustomIconButton } from "../../../shared/components/CustomIconButton";
import { Add } from "@mui/icons-material";
import { useState } from "react";
import { AddLeaveBalance } from "./AddLeaveBalance";
import { LeaveBalanceRequestModel } from "../model";


const initialLeavBalanceValue: LeaveBalanceRequestModel = {
    employeeId: "",
    leaveTypeBalances: []
}

export const LeaveBalance = () => {
    const { formatMessage: i } = useIntl();
    const [isOpen, setOpen] = useState(false);

    const handleClose = () => {
        setOpen(false);
    }
    return (
        <>
            <Card className="p-4 h-100">
                <Stack className="flex-row justify-content-between mb-4">
                    <Typography variant="h5">{i({ id: "LEAVE_BALANCE" })}</Typography>
                    <CustomIconButton icon={<Add />} handleClick={() => setOpen(true)} tooltip={i({ id: "ADD_LEAVE_BALANCE" })} />
                </Stack>
            </Card>
            {
                isOpen && <AddLeaveBalance open={true} initialValues={initialLeavBalanceValue} handleClose={handleClose} />
            }
        </>
    )
}