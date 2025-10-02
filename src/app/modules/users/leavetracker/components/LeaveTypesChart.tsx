import { Grid, Card, Stack, Typography, Avatar, Skeleton } from "@mui/material"
import { useCallback } from "react";
import { useIntl } from "react-intl"
import { EmployeeLeaveTypeBalance } from "../../../leaves/model";
import { CustomCard } from "../../../../shared/components/CustomCard";
import { LeaveTypeMapper } from "../../../../../utils/common";
import DonutApexChart from "../../../../shared/components/DonutApexChart";
import { toAbsoluteUrl } from "../../../../../_themes/helpers";

interface PropsType {
    leaveBalance: EmployeeLeaveTypeBalance[],
    isLoading: boolean
}

export const EmployeeLeaveTypesCharts = ({ leaveBalance, isLoading }: PropsType) => {
    const { formatMessage: i } = useIntl();
    const getLabelAndDataForLeaveType = useCallback((leaveType: EmployeeLeaveTypeBalance) => {
        return {
            [i({ id: "LEAVE.REMAINING" })]: leaveType.remainingLeave,
            [i({ id: "LEAVE.TAKEN" })]: leaveType.maximumLeave - leaveType.remainingLeave
        };
    }, []);

    if (isLoading) {
        return <Card
            sx={{ minHeight: "280px" }}
            className="p-4 d-flex flex-column"
        >
            <Stack spacing={1} className="flex-grow-1 ">
                <Skeleton variant="text" className="fs-20" />
            </Stack>
        </Card>
    }

    if (leaveBalance.length === 0) {
        return <Card className="py-6 d-flex flex-column align-items-center">
            <img
                className="mx-auto"
                src={toAbsoluteUrl("media/Icons/no_data_256.png")}
                style={{ maxWidth: 200 }}
            />
            <Typography variant="h6" className="fs-24">{i({ id: "ERROR.OPPS" })}</Typography>
            <Typography variant="h6">{i({ id: "MESSAGE.NO_LEAVE_DATA_AVAILABLE" })}</Typography>
        </Card>
    }

    return (
        <Grid container spacing={2}>
            {leaveBalance.map(type => {
                const leaveBalanceObj = getLabelAndDataForLeaveType(type);
                return <Grid key={type.leaveType} item xs={12} sm={6}>
                    <CustomCard label={i({ id: LeaveTypeMapper[type.leaveType] })} value={type.maximumLeave}  >
                        <DonutApexChart labels={Object.keys(leaveBalanceObj)} series={Object.values(leaveBalanceObj)} />
                    </CustomCard>
                </Grid>
            })
            }
        </Grid >
    )
}