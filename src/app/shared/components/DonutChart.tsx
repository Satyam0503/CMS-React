import { styled, useColorScheme } from "@mui/material";
import { useDrawingArea } from "@mui/x-charts/hooks";
import { PieChart, PieSeries } from "@mui/x-charts/PieChart"
import { getChartPalette } from "../../modules/theme/themePalettes";

interface DonutChartProps {
    loading: boolean,
    series: PieSeries[],
    hideLegend?: boolean,
    height?: number,
    centerLabel?: React.ReactNode,
}


export const DonutChart = (props: DonutChartProps) => {
    const { loading, series, hideLegend = false, height = 200, centerLabel } = props;
    const { mode, systemMode } = useColorScheme();
    return (
        <PieChart
            series={series}
            loading={loading}
            hideLegend={hideLegend}
            height={height}
            style={{ width: "100%", height: "100%", display: "block" }}

            colors={getChartPalette(mode, systemMode)}
            slotProps={{
                legend: {
                    direction: 'horizontal',
                    position: {
                        vertical: 'bottom',
                        horizontal: 'center'
                    },
                    sx: {
                        justifyContent: "center",
                        gap: '10px',
                        marginTop: 2,
                        ['.MuiChartsLegend-series']: {
                            gap: '5px',
                        },
                    },
                }
            }}
        >
            {centerLabel && <PieCenterLabel>{centerLabel}</PieCenterLabel>}
        </PieChart>
    )
}

const StyledText = styled('text')(({ theme }) => ({
    fill: theme.vars?.palette.text.primary,
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