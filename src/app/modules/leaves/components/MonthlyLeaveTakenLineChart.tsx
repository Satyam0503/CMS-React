import { Box, Card, Stack, Typography, useTheme } from "@mui/material";
import { BarChart, } from "@mui/x-charts";
import { useIntl } from "react-intl";
import { useEffect, useState } from "react";
import { getMonthlyLeaveTakenSummary } from "../leaveServices";
import { MonthlyLeaveTakenSummary } from "../model";
import dayjs from "dayjs";

export const MonthlyLeaveTakenLineChart = () => {
    const { formatMessage: i } = useIntl();
    const [loading, setLoading] = useState(true);
    const [chartData, setChartData] = useState<MonthlyLeaveTakenSummary[]>([]);
    const theme = useTheme();
    const monthShort = dayjs.monthsShort();

    useEffect(() => {
        (async () => {
            try {
                const { data } = await getMonthlyLeaveTakenSummary(new Date().getFullYear());
                if (data.success) {
                    // console.log(data.methodResults);

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

    return (
        <Card sx={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0, minHeight: { xs: 260, sm: 300 }, p: { xs: 1.5, sm: 2 } }}>
            <Stack direction="row" flexWrap="wrap" gap={1} className="mb-2 justify-content-between">
                <Typography className="fw-bold fs-16">{i({ id: "LEAVE.TITLES.MONTHLY_LEAVE_SUMMARY" })}</Typography>
                <Typography className="fw-bold fs-16">{dayjs().format("YYYY")}</Typography>
            </Stack>
            <Box sx={{ flex: 1, minHeight: 0 }}>
                <BarChart
                    series={[{
                        data: chartData.map(item => item.totalLeavesTaken),
                        label: i({ id: "LEAVE.TITLES.LEAVE_TAKEN" }),
                        color: theme.vars?.palette.primary.main
                    }]}
                    xAxis={
                        [{ scaleType: 'band', data: chartData.map(item => monthShort[item.month - 1]), tickPlacement: "middle", tickLabelPlacement: "middle" }]
                    }
                    yAxis={[{ width: 50, label: i({ id: "LEAVE.TITLES.LEAVE_TAKEN" }) }]}
                    slotProps={{
                        legend: {
                            direction: 'horizontal',
                            position: { vertical: 'bottom', horizontal: 'center' },
                        }
                    }}
                    // colors={chartColorpalette[theme]}
                    borderRadius={4}
                    margin={{ top: 5, bottom: 0, left: 0, right: 10 }}
                    loading={loading}
                    style={{ width: "100%", height: "100%", display: "block" }}
                />
            </Box>
        </Card >
    );
};
