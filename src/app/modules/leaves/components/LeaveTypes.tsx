import { Card, Stack, Typography } from "@mui/material"
import { useIntl } from "react-intl"
import { CustomIconButton } from "../../../shared/components/CustomIconButton";
import { Add } from "@mui/icons-material";
import { useEffect, useState } from "react";
import { CustomisedTable } from "../../../shared/components/CustomisedTable";
import { LeaveTypeColumnList } from "../../../../utils/constant/Constant";
import { LeaveType } from "../model";
import { AddLeaveTypes } from "./AddLeaveTypes";
import { LEAVE_TYPE } from "../../../../utils/enums";
import { getLeaveTypes } from "../leaveServices";

const initialLeaveTypeValue: LeaveType = {
    leaveTypeId: "",
    isHalfDay: false,
    minAdvanceNoticeDate: 1,
    isActive: true,
    maxLeaveDays: 1,
    leaveType: LEAVE_TYPE.SICK_LEAVE
}

export const LeaveTypes = () => {
    const [open, setOpen] = useState(false);
    const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
    const [isEdit, setEdit] = useState(false);
    const [leaveTypeValues, setLeaveTypeValues] = useState(initialLeaveTypeValue);
    const [refresh, setRefresh] = useState(false);
    const { formatMessage: i } = useIntl();

    const handleLeaveTypeEdit = (row: LeaveType) => {
        setEdit(true);
        setLeaveTypeValues(row);
        setOpen(true);
    }

    const handleClose = () => {
        setOpen(false)
        setEdit(false);
        setLeaveTypeValues(initialLeaveTypeValue);
    }

    const handleRefresh = () => {
        setRefresh(!refresh);
    }

    useEffect(() => {
        (async () => {
            try {
                const { data } = await getLeaveTypes();
                if (data.success) {
                    setLeaveTypes(data.methodResults);
                }
            } catch (error: any) {
                console.error(error.message);
            }
        })();
    }, [refresh])

    return (
        <Card className="p-4 gap-4 d-flex flex-column flex-grow-1">
            <Stack className="flex-row justify-content-between ">
                <Typography variant="h5">{i({ id: "LEAVE.TITLES.LEAVE_TYPES" })}</Typography>
                <CustomIconButton icon={<Add />} handleClick={() => setOpen(true)} tooltip={i({ id: "LEAVE.TITLES.ADD_LEAVE_TYPE" })} />
            </Stack>
            <CustomisedTable keyName="leaveTypeId" columns={LeaveTypeColumnList} rows={leaveTypes} page={0} rowsPerPage={20} handleEdit={handleLeaveTypeEdit} />
            {
                open && <AddLeaveTypes initialLeaveTypeValue={leaveTypeValues} open={true} handleClose={handleClose} isEdit={isEdit} handleRefresh={handleRefresh} />
            }
        </Card>

    )
}