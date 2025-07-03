import { Card, Typography } from "@mui/material";
import { useState } from "react";
import { useIntl } from "react-intl"
import { CustomisedTable } from "../../../shared/components/CustomisedTable";
import { ModulesName } from "../../../../utils/enums";
import { LeaveRequestTableColumnList } from "../../../../utils/constant/Constant";
import { LeaveRequestModel } from "../model";

export const LeaveRequest = () => {
    const { formatMessage: i } = useIntl();
    const [leaveRequest, setLeaveRequest] = useState<LeaveRequestModel[]>([]);
    const [paginationValues, setPaginationValues] = useState({ pageNo: 0, records: 10 });
    return (
        <Card className="p-4">
            <Typography variant="h5" className="mb-4">{i({ id: "LEAVE_REQUEST" })}</Typography>
            <CustomisedTable
                keyName="leaveRequestId"
                rows={leaveRequest}
                columns={LeaveRequestTableColumnList}
                tabName={ModulesName.LeaveManagement}
                page={paginationValues.pageNo}
                rowsPerPage={paginationValues.records}
            />
        </Card>
    )
}