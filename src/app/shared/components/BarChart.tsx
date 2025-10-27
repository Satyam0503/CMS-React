import { Grid, useTheme } from "@mui/material";
import { ApexOptions } from "apexcharts";
import { FC } from "react";
import Chart from "react-apexcharts";
import { rainbowSurgePalette } from '@mui/x-charts/colorPalettes';
import { useThemeContext } from "../../Context/ThemeContext";
import { chartColorpalette } from "../../modules/theme/MuiTheme";


interface BarChartProps {
  series: Array<number>;
  labels: Array<string>;
  height?: number;
  legendOption?: {
    show?: boolean;
    position?: "top" | "right" | "bottom" | "left";
  };
  showXAxisLabel?: boolean;
}



export const BarChart: FC<BarChartProps> = (props) => {

  const barWidth = 100; // pixels per bar (tweak as needed)
  const padding = 10; // extra space for axes, etc.
  const minChartWidth = 380;

  // Calculate required width
  const dynamicWidth = Math.max(minChartWidth, props.labels.length * barWidth + padding);
  const { series, labels, height, legendOption, showXAxisLabel } = props;
  const { palette } = useTheme();
  const { theme } = useThemeContext();
  const chartOption: ApexOptions = {
    chart: {
      toolbar: {
        tools: {
          download: false,
        }
      },
      animations: {
        enabled: true,
        speed: 800,
        dynamicAnimation: {
          enabled: true,
          speed: 800,
        },
      },
      height: height || 220,
      type: "bar",
    },
    colors: chartColorpalette[theme],
    fill: {
      opacity: 1,
    },
    labels: [...labels],
    plotOptions: {
      bar: {
        borderRadius: 4,
        borderRadiusApplication: "end",
        columnWidth: 40,
        distributed: true,
      },
    },
    dataLabels: {
      enabled: true,
    },
    legend: {
      show: legendOption?.show || true,
      position: legendOption?.position || "bottom",
      offsetY: 5,
      fontWeight: 600,
      itemMargin: {
        horizontal: 10,
        vertical: 2,
      },
      labels: {
        useSeriesColors: true
      }
    },
    xaxis: {
      categories: labels,
      labels: {
        show: showXAxisLabel || false,
        trim: true,
        style: {
          colors: [palette.common.black],
          fontSize: "12px",
        },
        offsetY: -2,
      },
    },
    yaxis: {
      show: false,
    },
    tooltip: {
      custom: function ({ series, seriesIndex, dataPointIndex, w }) {
        const bgColor = w.globals.colors[dataPointIndex];
        return `
            <div class="chart_tooltip" style="background-color:${bgColor}"> 
                <span>${w.globals.labels[dataPointIndex]}</span> :
                <span>${series[seriesIndex][dataPointIndex]}</span> 
            <div>
            `;
      },
    },
  };
  return (
    <Grid item xs={12} className="overflow-x-scroll">
      <div style={{ minWidth: `${dynamicWidth}px`, width: '100%' }}>
        <Chart
          options={chartOption}
          series={[
            {
              data: series,
            },
          ]}
          type="bar"
          height={height || 220}
          width="100%"
        />
      </div>
    </Grid>
  );
};
