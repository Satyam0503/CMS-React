import { Card, Stack, Typography } from "@mui/material";
import { areaElementClasses, BarChart, LineChart, lineElementClasses } from "@mui/x-charts";
import { useIntl } from "react-intl";
import { chartColorpalette } from "../../theme/MuiTheme";
import { useThemeContext } from "../../../Context/ThemeContext";
import { useEffect, useState } from "react";
import { getMonthlyLeaveTakenSummary } from "../leaveServices";
import { MonthlyLeaveTakenSummary } from "../model";
import { monthMapper } from "../../../../utils/common";

const pData = [2400, 1398, 9800, 3908, 4800, 3800, 4300];
const xLabels = [
    'Page A',
    'Page B',
    'Page C',
    'Page D',
    'Page E',
    'Page F',
    'Page G',
];
export const MonthlyLeaveTakenLineChart = () => {
    const { formatMessage: i } = useIntl();
    const { theme } = useThemeContext();
    const [loading, setLoading] = useState(true);
    const [chartData, setChartData] = useState<MonthlyLeaveTakenSummary[]>([]);
    useEffect(() => {
        (async () => {
            try {
                const { data } = await getMonthlyLeaveTakenSummary(new Date().getFullYear());
                if (data.success) {
                    setChartData(data.methodResults);
                }
            }
            catch (error) {
                console.error("Error fetching monthly leave taken summary:", error);
            }
            finally {
                setLoading(false);
            }
        })();
    }, []);
    const xAxisLabels = chartData.map(item => i({ id: monthMapper[item.month] }));
    return (
        <Card className="p-4 flex-grow-1">
            <Stack>
                <Typography className="fw-bold fs-16">{i({ id: "LEAVE.TITLES.MONTHLY_LEAVE_SUMMARY" })}</Typography>
            </Stack>
            <BarChart
                series={[{
                    data: chartData.map(item => item.totalLeavesTaken),
                    minBarSize: 2,
                    label: i({ id: "LEAVE.TITLES.LEAVE_TAKEN" })
                }]}
                xAxis={
                    [{ scaleType: 'band', data: xAxisLabels }]
                }
                yAxis={[{ width: 50, label: i({ id: "LEAVE.TITLES.LEAVE_TAKEN" }) }]}
                slotProps={{
                    legend: {
                        direction: 'horizontal',
                        position: { vertical: 'bottom', horizontal: 'center' },
                    }
                }}
                colors={chartColorpalette[theme]}
                borderRadius={4}
                height={200}
                loading={loading}
            />
        </Card>
    );
};
