import { Card, Stack, Typography } from "@mui/material"
import { useIntl } from "react-intl"
import { CustomIconButton } from "../../../shared/components/CustomIconButton";
import { Add } from "@mui/icons-material";
import { useState } from "react";
import { CustomisedTable } from "../../../shared/components/CustomisedTable";
import { LeaveTypeColumnList } from "../../../../utils/constant/Constant";
import { LeaveType } from "../model";
import { AddLeaveTypes } from "./AddLeaveTypes";
import { LEAVE_TYPE } from "../../../../utils/enums";

const initialLeaveTypeValue: LeaveType = {
    leaveTypeId: "",
    isHalfDay: false,
    minAdvanceNoticeDate: 1,
    isActive: true,
    leaveTypes: LEAVE_TYPE.SICK_LEAVE
}

export const LeaveTypes = () => {
    const [open, setOpen] = useState(false);
    const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
    const [isEdit, setEdit] = useState(false);
    const [leaveTypeValues, setLeaveTypeValues] = useState(initialLeaveTypeValue);
    const { formatMessage: i } = useIntl();
    const handleClose = () => {
        setOpen(false)
    }
    return (
        <Card className="p-4 h-100">
            <Stack className="flex-row justify-content-between mb-4">
                <Typography variant="h5">{i({ id: "LEAVE_TYPES" })}</Typography>
                <CustomIconButton icon={<Add />} handleClick={() => setOpen(true)} />
            </Stack>
            <CustomisedTable keyName="leaveTypeId" columns={LeaveTypeColumnList} rows={leaveTypes} page={1} rowsPerPage={20} />
            {
                open && <AddLeaveTypes initialLeaveTypeValue={leaveTypeValues} open={true} handleClose={handleClose} isEdit={isEdit} />
            }
        </Card>

    )
}