import { styled } from "@mui/material";
import { useDrawingArea } from "@mui/x-charts/hooks";
import { PieChart, PieSeries } from "@mui/x-charts/PieChart"
import { rainbowSurgePalette } from '@mui/x-charts/colorPalettes';
import { useThemeContext } from "../../Context/ThemeContext";

export const defaultPieChartSeries: PieSeries = {
    innerRadius: '60%',
    outerRadius: '100%',
    paddingAngle: 2,
    startAngle: -90,
    highlightScope: { fade: 'global', highlight: 'item' },
    highlighted: { additionalRadius: 2 },
    cornerRadius: 4,
    data: [],
}

interface DonutChartProps {
    loading: boolean,
    series: PieSeries[],
    hideLegend?: boolean,
    height?: number,
    centerLabel?: React.ReactNode,
}


export const DonutChart = (props: DonutChartProps) => {
    const { loading, series, hideLegend = false, height = 200, centerLabel } = props;
    const { theme } = useThemeContext();
    return (
        <PieChart
            series={series}
            loading={loading}
            hideLegend={hideLegend}
            height={height}
            colors={rainbowSurgePalette(theme)}
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