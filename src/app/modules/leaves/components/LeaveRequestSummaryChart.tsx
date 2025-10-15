import { Box, Card, Stack, styled, Typography } from "@mui/material"
import { PieChart, PieChartProps, PieSeries } from '@mui/x-charts/PieChart';
import { useEffect, useMemo, useState } from "react";
import { LeaveRequestSummary } from "../model";
import { getLeaveRequestSummary } from "../leaveServices";
import { CustomCard } from "../../../shared/components/CustomCard";
import { IntlShape, useIntl } from "react-intl";
import { MakeOptional } from "@mui/x-date-pickers/internals";
import { labelClasses, PieValueType, useDrawingArea } from "@mui/x-charts";
import { leaveRequestStatusMapper } from "../../../../utils/common";
import dayjs from "dayjs";

type CreateChartDataType = (data: LeaveRequestSummary, view: "type" | "status", intl: IntlShape) => MakeOptional<PieValueType, "id">[];

const createChartData: CreateChartDataType = (data, view, intl) => {
    const { formatMessage: i } = intl;
    const chartData: MakeOptional<PieValueType, "id">[] = [];
    if (view === "status") {

        for (const key in data.leaveStatusSummary) {
            // if (!Object.hasOwnProperty(data.leaveStatusSummary, key)) continue;
            chartData.push({
                label: i({ id: leaveRequestStatusMapper[key] }),
                value: data.leaveStatusSummary[key],
            })
        }
    }
    return chartData;
}

export const LeaveRequestSummaryChart = () => {
    const intl = useIntl();
    const { formatMessage: i } = intl;
    const [loading, setLoading] = useState(true);
    const [leaveRequestSummary, setLeaveRequestSummary] = useState<LeaveRequestSummary>()
    const series: PieSeries[] = useMemo(() => {
        return [
            {
                innerRadius: '60%',
                outerRadius: '100%',
                paddingAngle: 3,
                startAngle: -50,
                highlightScope: { fade: 'global', highlight: 'item' },
                highlighted: { additionalRadius: 2 },
                cornerRadius: 4,
                data: Boolean(leaveRequestSummary) ? createChartData(leaveRequestSummary!, "status", intl) : [],
            }
        ];
    }, [leaveRequestSummary])

    useEffect(() => {
        (async () => {
            try {
                const { data } = await getLeaveRequestSummary();
                if (data.success) {
                    setLeaveRequestSummary(data.methodResult);
                }
            } catch (error) {
                console.error((error as Error).message)
            }
            finally {
                setLoading(false);
            }
        })();
    }, [])
    return (
        <CustomCard label={i({ id: "LEAVE.TITLES.LEAVE_REQUESTS" })} value={dayjs().format("MMM YYYY")}>
            <PieChart
                series={series}
                loading={loading}
                hideLegend={false}
                height={200}
                slotProps={{
                    legend: {
                        direction: 'horizontal',
                        position: {
                            vertical: 'bottom',
                            horizontal: 'center'
                        },
                        sx: {
                            gap: '10px',
                            marginTop: 2,
                            ['.MuiChartsLegend-series']: {
                                gap: '5px',
                            },
                        },
                    }
                }}
            >
                <PieCenterLabel>{leaveRequestSummary?.totalRequests}</PieCenterLabel>
            </PieChart>
        </CustomCard>
    )
}

const StyledText = styled('text')(({ theme }) => ({
    fill: theme.palette.text.primary,
    textAnchor: 'middle',
    dominantBaseline: 'central',
    textAlign: "center",
    fontSize: 28,

}));

function PieCenterLabel({ children }: { children: React.ReactNode }) {
    const { width, height, left, top } = useDrawingArea();
    return (
        <StyledText x={left + width / 2} y={top + height / 2}>
            {children}
        </StyledText>
    );
}